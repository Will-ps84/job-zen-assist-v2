import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

// Short-lived signed URL expiration (1 hour)
const SIGNED_URL_EXPIRATION = 3600;

export function useResumeStorage() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadResume = async (file: File, resumeId: string) => {
    if (!user) return { error: new Error('No user') };

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Tipo de archivo no válido. Solo PDF y DOCX.');
      return { error: new Error('Invalid file type') };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Archivo muy grande. Máximo 10MB.');
      return { error: new Error('File too large') };
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${resumeId}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Store only the file path in database, NOT a signed URL
      // Signed URLs will be generated on-demand when downloading
      const { error: updateError } = await supabase
        .from('resumes')
        .update({
          file_url: filePath, // Store path only, not signed URL
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resumeId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success('CV subido correctamente');
      return { 
        data: { 
          path: filePath, 
          name: file.name,
          size: file.size,
          type: file.type,
        } 
      };
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Error al subir el archivo');
      return { error };
    } finally {
      setUploading(false);
    }
  };

  const deleteResumeFile = async (resumeId: string, filePath: string) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Clear file metadata from resume
      const { error: updateError } = await supabase
        .from('resumes')
        .update({
          file_url: null,
          file_name: null,
          file_type: null,
          file_size: null,
        })
        .eq('id', resumeId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success('Archivo eliminado');
      return { success: true };
    } catch (error) {
      console.error('Error deleting resume file:', error);
      toast.error('Error al eliminar archivo');
      return { error };
    }
  };

  // Generate a short-lived signed URL on-demand for download
  const getDownloadUrl = async (filePath: string): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, SIGNED_URL_EXPIRATION);

      if (error) {
        console.error('Error creating signed URL:', error);
        return null;
      }

      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error getting download URL:', error);
      return null;
    }
  };

  const downloadResume = async (filePath: string, fileName: string) => {
    try {
      // Generate short-lived signed URL on-demand
      const signedUrl = await getDownloadUrl(filePath);
      
      if (!signedUrl) {
        toast.error('Error al generar enlace de descarga');
        return { error: new Error('Failed to get download URL') };
      }

      const response = await fetch(signedUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Error al descargar archivo');
      return { error };
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    uploadResume,
    deleteResumeFile,
    downloadResume,
    getDownloadUrl,
    formatFileSize,
    uploading,
  };
}
