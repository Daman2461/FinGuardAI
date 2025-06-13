import React, { useCallback } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload = ({ onUpload, disabled }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    disabled
  });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 4,
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.300',
        backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'action.hover'
        }
      }}
    >
      <input {...getInputProps()} />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? 'Drop the file here'
            : 'Drag and drop your invoice here, or click to select'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supported formats: PDF, PNG, JPG, JPEG
        </Typography>
      </Box>
    </Paper>
  );
};

export default FileUpload; 