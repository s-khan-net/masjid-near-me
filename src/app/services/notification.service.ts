import { Injectable } from '@angular/core';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { AlAdhanOptions, SalaahTimesService } from './salaah-times.service';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private _salaahTimesService: SalaahTimesService) { }

  //region notification methods
  async scheduleNotification() {
    // alert('Notification scheduled in 1 minute');
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Isha',
          body: 'Time for Isha Salaah in your area. \n Tap to find a masjid near you',
          smallIcon: 'notification_icon.png',
          largeIcon: 'icon.png',
          iconColor: '#99ccbe',
          id: 1,
          schedule: { at: new Date(Date.now() + 1000 * 5) }, // 5 seconds later
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  }

  async scheduleSalaahNotifications(salaahTimesOptions: AlAdhanOptions) {
    //get notification for the next 19 days form aladhan
    this._salaahTimesService.getTimes(salaahTimesOptions, 19).subscribe(async (notificationData: any) => {
      //create notifications based on the data received
      if (notificationData && notificationData.data && notificationData.data.length > 0) {
        //remove existing salaah notifications
        await this.cancelAllNotifications();
        //create channel
        const channels = (await LocalNotifications.listChannels()).channels;
        if (!channels || channels.length == 0) {
          await this._createChannel();
        }
        else {
          if (channels.filter(c => { return c.id == 'mnm-salaah' }).length == 0) {
            await this._createChannel();
          }
        }
        let notificationsArray: LocalNotificationSchema[] = [];
        let idCounter = 1;
        for (let data of notificationData.data) {
          let gregorianDate = data.date.gregorian;
          let day = Number(gregorianDate.day);
          let month = gregorianDate.month.number - 1;
          let year = Number(gregorianDate.year);
          let now = new Date(year, month, day)
          const times = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
          //create notification for each salaah 
          Object.keys(data.timings).forEach(time => {
            if (times.indexOf(time) > -1) {
              const s = now.getDay() == 5 ? 'Jumah' : 'Dhuhr';
              const sTime = time == 'Dhuhr' ? s : time;
              const scheduleAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(data.timings[time].split(' ')[0].split(':')[0]), Number(data.timings[time].split(' ')[0].split(':')[1]),0,0);
              if (scheduleAt > new Date()) {
                notificationsArray.push(this.getNotificationObj(`${sTime} `, `Time for ${sTime} Salaah in your area. \n Tap to find a masjid near you`, idCounter++, scheduleAt));
              }
            }
          });
        }
        //add a slight delay to ensure all previous notifications are cleared before adding new ones
        setTimeout(async () => {
          if (notificationsArray.length > 0) {
            await LocalNotifications.schedule({
              notifications: notificationsArray
            });
          }
        }, 500);
      }
    });
  }

  private async _createChannel() {
    await LocalNotifications.createChannel({
      id: 'mnm-salaah',
      name: 'Salaah',
      description: 'Salaah time notifications',
      vibration: true
    });
  }

  private getNotificationObj(title: string, body: string, id: number, scheduleAt: Date): LocalNotificationSchema {
    const notificationObj: LocalNotificationSchema = {
      title: title,
      body: body,
      smallIcon: 'notification_icon.png',
      largeIcon: 'icon.png',
      iconColor: '#99ccbe',
      id: id,
      schedule: { at: scheduleAt },
      channelId: 'mnm-salaah'
    };
    return notificationObj;
  }

  async getPendingNotifications() {
    const pending = await LocalNotifications.getPending();
    return pending;
  }

  async areEnabled() {
    const notifs = await LocalNotifications.checkPermissions();
    return new Promise<boolean>((resolve) => {
      if (notifs.display === 'granted') {
        resolve(true);
      }
      else {
        resolve(false);
      }
    });
  }

  async cancelAllNotifications() {
    LocalNotifications.getPending().then(async (pending) => {
      for (let notif of pending.notifications) {
        await LocalNotifications.cancel({ notifications: [{ id: notif.id }] });
      }
    });
    const channels = (await LocalNotifications.listChannels()).channels;
    if (channels.filter(c => { return c.id == 'mnm-salaah' }).length > 0) {
      await LocalNotifications.deleteChannel({ id: 'mnm-salaah' });
    }
  }

  async cancelPastNotifications() {
    const pending = await LocalNotifications.getPending();
    if (!pending || !pending.notifications || pending.notifications.length == 0) {
      return new Promise<boolean>((resolve) => { resolve(true); });
    }
    const now = new Date();
    for (let notif of pending.notifications) {
      if (notif.schedule && notif.schedule.at && new Date(notif.schedule.at) < now) {
        await LocalNotifications.cancel({ notifications: [{ id: notif.id }] });
      }
      else {
        break;
      }
    }
    return new Promise<boolean>((resolve) => { resolve(true); });
  }
  async requestPermission() {
    const notificationsEnabled = await LocalNotifications.checkPermissions();
    if (notificationsEnabled.display === 'granted') {
      return true;
    }
    else {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display === 'granted') {
        return true;
      }
      else {
        return false;
      }
    }
  }
  //endregion
}
