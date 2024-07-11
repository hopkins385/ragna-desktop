import MatomoTracker from 'matomo-tracker';

const siteId = 7;
const trackerUrl = 'https://matomo.faiwr.com/matomo.php';

let matomoSingleton: MatomoTracker;

function getAnalyticsSingleton() {
  if (!matomoSingleton) {
    matomoSingleton = new MatomoTracker(siteId, trackerUrl);

    matomoSingleton.on('error', function (err) {
      console.log('error tracking request: ', err);
    });
  }

  return matomoSingleton;
}

export async function trackEvent(actionName: string) {
  const matomo = getAnalyticsSingleton();
  console.log('Tracking Event: ', actionName);
  new Promise((resolve) => {
    matomo.track({
      url: 'http://localhost/index.html',
      action_name: actionName
    });
    resolve('Success');
  });
}
