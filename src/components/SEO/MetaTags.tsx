import Head from 'next/head';
import { useRouter } from 'next/router';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  title = "PFA - Personalized E-Learning Adventure",
  description = "Discover personalized learning paths, interactive modules, and real-time features on our e-learning platform.",
  keywords = "e-learning, online courses, personalized learning, education platform",
  ogImage = "/images/og-image.jpg",
  ogType = "website"
}) => {
  const router = useRouter();
  const canonicalUrl = `https://yourpfadomain.com${router.asPath}`;
  
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Social Media */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
    </Head>
  );
};

export default MetaTags;