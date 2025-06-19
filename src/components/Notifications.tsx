
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, Settings } from 'lucide-react';
import { mockNotifications } from '@/utils/mockData';

export function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request':
        return '📋';
      case 'approval':
        return '✅';
      case 'rejection':
        return '❌';
      case 'reminder':
        return '⏰';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      request: 'bg-blue-100 text-blue-800 border-blue-300',
      approval: 'bg-green-100 text-green-800 border-green-300',
      rejection: 'bg-red-100 text-red-800 border-red-300',
      reminder: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[type as keyof typeof colors] || colors.request;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {unreadCount} non lue(s)
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check size={16} className="mr-2" />
              Tout marquer comme lu
            </Button>
          )}
          <Button variant="outline">
            <Settings size={16} className="mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
            <p className="text-gray-500">Vous êtes à jour ! Aucune nouvelle notification.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <Badge className={getNotificationColor(notification.type)}>
                            {notification.type === 'request' ? 'Demande' :
                             notification.type === 'approval' ? 'Approbation' :
                             notification.type === 'rejection' ? 'Refus' :
                             'Rappel'}
                          </Badge>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-sm text-gray-500">
                          {notification.timestamp.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check size={14} />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:bg-red-50 border-red-300"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Paramètres des notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Nouvelles demandes de congé</h4>
                <p className="text-sm text-gray-500">Recevoir une notification pour chaque nouvelle demande</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Approbations de demandes</h4>
                <p className="text-sm text-gray-500">Notification quand vos demandes sont approuvées</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Rappels de retour</h4>
                <p className="text-sm text-gray-500">Rappel la veille du retour de congé</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Notifications par email</h4>
                <p className="text-sm text-gray-500">Recevoir également les notifications par email</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
