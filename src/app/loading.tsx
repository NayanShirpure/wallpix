
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto max-w-7xl px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-3">
          <Skeleton className="h-8 w-24" /> {/* Logo/Site Name */}
          <div className="flex-1 flex justify-center items-center px-2 sm:px-4">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
              <div className="flex w-full items-center space-x-1 sm:space-x-2">
                 <Skeleton className="h-9 flex-grow rounded-md" /> {/* Search Input */}
                 <Skeleton className="h-9 w-9 rounded-md shrink-0" /> {/* Search Button */}
              </div>
            </div>
          </div>
          <div className="flex items-center shrink-0 gap-x-1.5 sm:gap-x-2">
            <Skeleton className="h-9 w-20 rounded-md hidden sm:flex" /> {/* Desktop Nav Placeholder */}
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Theme/Menu Toggle */}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto max-w-7xl p-4 md:p-6 space-y-6 sm:space-y-8">
        <Skeleton className="h-10 w-1/2 mx-auto" />
        <Skeleton className="w-full aspect-video rounded-xl max-h-[350px] sm:max-h-[400px]" />
        <Skeleton className="h-8 w-1/3 mt-4" />
        
        <div className="my-masonry-grid" aria-busy="true" aria-live="polite">
          {[...Array(12)].map((_, i) => (
            <div key={`loading-page-grid-skeleton-column-${i}`} className="my-masonry-grid_column">
                 <div style={{ marginBottom: '1rem' }}>
                    <Skeleton 
                        key={`loading-page-grid-skeleton-item-${i}`} 
                        className={`w-full rounded-lg bg-muted/70 h-72`} 
                    />
                </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-muted-foreground text-sm mt-auto py-4 sm:py-6 border-t border-border bg-card/80 backdrop-blur-sm print:hidden">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4">
          <Skeleton className="h-4 w-full sm:w-1/3" /> 
          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex items-center justify-center md:justify-end gap-x-4 sm:gap-x-5">
              <Skeleton className="h-5 w-5 rounded-full" /> 
              <Skeleton className="h-5 w-5 rounded-full" /> 
              <Skeleton className="h-5 w-5 rounded-full" /> 
            </div>
            <div className="flex gap-x-3 sm:gap-x-4 gap-y-1.5 flex-wrap justify-center md:justify-end">
              <Skeleton className="h-4 w-10" /> 
              <Skeleton className="h-4 w-12" /> 
              <Skeleton className="h-4 w-16" /> 
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
