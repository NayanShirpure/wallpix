
import { blogPosts } from '@/config/blog';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, UserCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { StructuredData } from '@/components/structured-data';
// Updated import for local minimal types
import type { 
  BlogPosting, 
  Person, 
  Organization, 
  ImageObject as SchemaImageObject, // Renamed to avoid conflict
  WebPage as SchemaWebPage, // Renamed to avoid conflict
  MinimalWithContext 
} from '@/types/schema-dts';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({
  params,
}: BlogPostPageProps) { // Added type annotation for params
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) notFound();

  const PostContent = (await post.contentComponent()).default;

  const allTagsAndKeywords = [
    ...(post.keywords || []),
    ...(post.tags || [])
  ];
  const uniqueKeywords = Array.from(new Set(allTagsAndKeywords));
  const keywordsString = uniqueKeywords.length > 0 ? uniqueKeywords.join(', ') : undefined;

  const articleSchema: MinimalWithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.opengraphImage
      ? `${BASE_URL}${post.opengraphImage.replace(/^\//, '')}`
      : `${BASE_URL}blog/og-blog-main.png`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author || 'Wallify Team',
    } as Person, 
    publisher: {
      '@type': 'Organization',
      name: 'Wallify',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}opengraph-image.png`,
      } as SchemaImageObject, 
    } as Organization, 
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}blog/${post.slug}`,
    } as SchemaWebPage, 
    keywords: keywordsString,
  };

  const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const currentIndex = sortedPosts.findIndex(p => p.slug === post.slug);
  
  const olderPost = currentIndex + 1 < sortedPosts.length ? sortedPosts[currentIndex + 1] : null;
  const newerPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;


  return (
    <>
      <StructuredData data={articleSchema} />
      <article className="w-full">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3">{post.title}</h1>
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            {post.author && (
              <div className="flex items-center">
                <UserCircle className="h-4 w-4 mr-1.5" />
                By {post.author}
              </div>
            )}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {post.opengraphImage && (
          <div className="relative aspect-video w-full max-w-3xl mx-auto rounded-lg overflow-hidden mb-8 shadow-lg">
            <Image
              src={post.opengraphImage}
              alt={`Cover image for ${post.title}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 768px, 1000px"
              className="object-cover"
              priority
              data-ai-hint="blog cover"
            />
          </div>
        )}

        <div className="prose prose-invert max-w-none dark:prose-invert 
                        prose-headings:text-primary prose-headings:font-semibold 
                        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-md prose-img:shadow-md
                        prose-p:text-foreground/90 prose-li:text-foreground/90
                        prose-strong:text-primary
                        prose-code:bg-muted prose-code:text-accent prose-code:p-1 prose-code:rounded-sm prose-code:text-sm
                        prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground">
          <PostContent />
        </div>
      </article>

      {(olderPost || newerPost) && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-6 text-center">
            Continue Reading
          </h2>
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            {olderPost ? (
              <Link href={`/blog/${olderPost.slug}`} passHref legacyBehavior>
                <a className="group flex-1 block p-4 sm:p-5 rounded-lg border bg-card hover:border-accent transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background">
                  <div className="flex items-center text-sm text-accent mb-1.5">
                    <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Previous Article
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-card-foreground group-hover:text-accent transition-colors line-clamp-2">
                    {olderPost.title}
                  </h3>
                </a>
              </Link>
            ) : (
              <div className="flex-1 hidden sm:block"></div> // Placeholder for spacing on larger screens if only "Next" exists
            )}

            {newerPost ? (
              <Link href={`/blog/${newerPost.slug}`} passHref legacyBehavior>
                <a className="group flex-1 block p-4 sm:p-5 rounded-lg border bg-card hover:border-accent transition-colors duration-200 shadow-sm hover:shadow-md text-left sm:text-right focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background">
                  <div className="flex items-center sm:justify-end text-sm text-accent mb-1.5">
                    Next Article
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-card-foreground group-hover:text-accent transition-colors line-clamp-2">
                    {newerPost.title}
                  </h3>
                </a>
              </Link>
            ) : (
              <div className="flex-1 hidden sm:block"></div> // Placeholder for spacing on larger screens if only "Previous" exists
            )}
          </div>
        </section>
      )}
    </>
  );
}
