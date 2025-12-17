import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

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
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get signed URL (valid for 1 year)
      const { data: urlData } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 31536000);

      const fileUrl = urlData?.signedUrl || '';

      // Update resume record with file metadata
      const { error: updateError } = await supabase
        .from('resumes')
        .update({
          file_url: fileUrl,
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
          url: fileUrl,
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

  const downloadResume = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
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
    formatFileSize,
    uploading,
  };
}
