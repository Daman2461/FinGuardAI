import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Fade
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const getRiskIcon = (level) => {
  const riskLevel = (level || 'low').toLowerCase();
  
  switch (riskLevel) {
    case 'high':
      return <ErrorIcon color="error" />;
    case 'medium':
      return <WarningIcon color="warning" />;
    case 'low':
    default:
      return <CheckCircleIcon color="success" />;
  }
};

const getRiskColor = (level) => {
  const riskLevel = (level || 'low').toLowerCase();
  
  switch (riskLevel) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
    default:
      return 'success';
  }
};

const RiskAssessment = ({ assessment }) => {
  const riskLevel = assessment?.risk_level || 'low';
  const confidenceScore = assessment?.confidence_score || 0;
  const findings = assessment?.findings || [];

  return (
    <Fade in={true} timeout={1000}>
      <Box sx={{ mt: 8 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 4,
            color: 'text.primary',
          }}
        >
          Risk Assessment
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: 'text.primary',
              }}
            >
              Overall Risk Level:
            </Typography>
            <Chip
              label={riskLevel.toUpperCase()}
              color={getRiskColor(riskLevel)}
              icon={getRiskIcon(riskLevel)}
              sx={{
                fontWeight: 600,
                '& .MuiChip-icon': {
                  color: 'inherit',
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: 'text.secondary',
              }}
            >
              Confidence Score:
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
              }}
            >
              {(confidenceScore * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Paper>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 3,
            color: 'text.primary',
          }}
        >
          Findings
        </Typography>

        <List sx={{ p: 0 }}>
          {findings.map((finding, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                mb: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <ListItem
                alignItems="flex-start"
                sx={{
                  p: 3,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getRiskIcon(riskLevel)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 500,
                        mb: 1,
                        color: 'text.primary',
                      }}
                    >
                      {typeof finding === 'string' ? finding : finding.description}
                    </Typography>
                  }
                  secondary={
                    <Box
                      component="span"
                      sx={{
                        display: 'block',
                        mt: 1,
                      }}
                    >
                      <Chip
                        size="small"
                        label={riskLevel.toUpperCase()}
                        color={getRiskColor(riskLevel)}
                        sx={{
                          mr: 1,
                          fontWeight: 500,
                          '& .MuiChip-icon': {
                            color: 'inherit',
                          },
                        }}
                      />
                      {typeof finding === 'object' && finding.details && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            mt: 1,
                          }}
                        >
                          {finding.details}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      </Box>
    </Fade>
  );
};

export default RiskAssessment; 