import { MetadataRoute } from 'next';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URLs
  const baseUrl = 'https://yourpfadomain.com';
  
  // Static routes
  const routes = [
    '',
    '/courses',
    '/about',
    '/contact',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));
  
  // Dynamic course pages
  try {
    const courseSnapshot = await getDocs(collection(db, 'courses'));
    const coursesRoutes = courseSnapshot.docs.map(doc => ({
      url: `${baseUrl}/courses/${doc.id}`,
      lastModified: new Date(doc.data().updatedAt?.toDate() || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
    
    return [...routes, ...coursesRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}