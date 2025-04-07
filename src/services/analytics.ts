import { getAnalytics, logEvent } from 'firebase/analytics';
import { app } from '../firebaseConfig';

export const trackPageView = (page: string, props?: Record<string, string>) => {
  try {
    const analytics = getAnalytics(app);
    logEvent(analytics, 'page_view', {
      page_path: page,
      page_location: window.location.href,
      page_title: document.title,
      ...props
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export const trackReferralSource = () => {
  try {
    const analytics = getAnalytics(app);
    
    // Track referrer
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    
    logEvent(analytics, 'user_acquisition', {
      referrer,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
};