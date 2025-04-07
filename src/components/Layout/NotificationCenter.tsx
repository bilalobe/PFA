import React, { useState, useEffect, useRef } from 'react';
import {
  Badge,
  Box,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Popover,
  CircularProgress,
  Divider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ForumIcon from '@mui/icons-material/Forum';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import MessageIcon from '@mui/icons-material/Message';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { Notification } from '../../interfaces/types';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { notificationApi } from '../../utils/api';
import TimeAgo from 'timeago-react';

const NotificationCenter: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout>();

  // Fetch notifications when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Set up polling for new notifications (every 60 seconds)
      intervalRef.current = setInterval(() => {
        fetchUnreadCount();
      }, 60000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await notificationApi.getUserNotifications(user.uid);
      setNotifications(response.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const count = await notificationApi.getUnreadNotificationCount(user.uid);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Refresh notifications when opening menu
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark notification as read
      await notificationApi.markNotificationAsRead(notification.id);
      
      // Update local state to mark this notification as read
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      ));
      
      // Update unread count
      if (!notification.isRead) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
      
      // Navigate to the linked page if available
      if (notification.link) {
        router.push(notification.link);
        handleCloseMenu();
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      await notificationApi.markAllNotificationsAsRead(user.uid);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageIcon />;
      case 'forum':
        return <ForumIcon />;
      case 'schedule':
        return <ScheduleIcon />;
      case 'announcement':
        return <AnnouncementIcon />;
      case 'course':
        return <SchoolIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpenMenu}
        aria-describedby={id}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 360, maxHeight: 500 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2}
            borderBottom="1px solid rgba(0, 0, 0, 0.12)"
          >
            <Typography variant="h6">Notifications</Typography>
            <Box>
              <IconButton size="small" onClick={handleMarkAllAsRead} title="Mark all as read">
                <ClearAllIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => router.push('/notifications/settings')} 
                title="Notification settings"
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Box p={2}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography color="textSecondary">No notifications</Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    button
                    alignItems="flex-start"
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      backgroundColor: notification.isRead ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
                      '&:hover': {
                        backgroundColor: notification.isRead ? 'rgba(0, 0, 0, 0.04)' : 'rgba(25, 118, 210, 0.12)',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: notification.isRead ? 'grey.400' : 'primary.main' }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          color="textPrimary"
                          sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textPrimary"
                            sx={{ display: 'block' }}
                          >
                            {notification.body}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="textSecondary"
                          >
                            <TimeAgo datetime={notification.createdAt.toDate()} />
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
          
          <Box p={1} borderTop="1px solid rgba(0, 0, 0, 0.12)" textAlign="center">
            <Button 
              size="small" 
              onClick={() => router.push('/notifications')}
            >
              View All
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationCenter;