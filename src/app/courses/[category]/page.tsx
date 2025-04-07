import { Metadata } from 'next';
import { getCoursesByCategory } from '../../../lib/courses';

// Dynamic metadata generation
export async function generateMetadata({ params }: { params: { category: string }}): Promise<Metadata> {
  const category = params.category;
  const formattedCategory = category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return {
    title: `${formattedCategory} Courses | PFA E-Learning`,
    description: `Discover top-rated ${formattedCategory} courses on PFA. Learn at your own pace with expert-led instruction.`,
    keywords: `${category}, online courses, e-learning, ${category} education, ${category} certification`,
  };
}

export default async function CategoryPage({ params }: { params: { category: string }}) {
  const courses = await getCoursesByCategory(params.category);
  
  // Component implementation...
}