export class MnmConstants {
  public static menuItems = [
    {
      name: 'Settings',
      icon: 'settings',
      fun: 'showSettings()',
      url: 'settings',
    },
    { name: 'Users', icon: 'people', fun: 'ShowSignIn()', url: 'settings' },
    { name: 'Compass', icon: 'compass', fun: 'setScreenForCompass()' },
    // {"name":"Verse","icon":"fa fa-bookmark-o fa-4x","fun":"showAyah()"},
    { name: 'Help', icon: 'help-circle', fun: 'showHelp()' },
    { name: 'Share', icon: 'share-social', fun: 'shareApp()' },
  ];
  public static baseUrl = 'http://localhost:8300/v1/';
  public static masjidMidPath = 'masjids/';
  public static usersMidPath = 'users/';
  public static alAdhanTimingsPath = 'https://api.aladhan.com/v1/timings/';
}
