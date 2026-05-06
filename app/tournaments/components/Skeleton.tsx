import React from "react";

export function CardSkeleton() {
    return (
        <div className="group bg-foreground/5 border border-foreground/5 rounded-[2.5rem] overflow-hidden flex flex-col animate-pulse">
            <div className="h-[280px] bg-foreground/10 relative" />
            <div className="p-10 flex-1 flex flex-col space-y-4">
                <div className="h-2 w-20 bg-primary/20 rounded-full" />
                <div className="h-6 w-3/4 bg-foreground/10 rounded-lg" />
                <div className="h-4 w-full bg-foreground/5 rounded-md" />
                <div className="h-4 w-5/6 bg-foreground/5 rounded-md" />
                <div className="mt-auto h-12 w-full bg-foreground/10 rounded-2xl" />
            </div>
        </div>
    );
}

export function FeaturedSkeleton({ isMain = false }: { isMain?: boolean }) {
    return (
        <div className={`bg-foreground/5 border border-foreground/5 flex flex-col md:flex-row h-full rounded-[2.5rem] overflow-hidden animate-pulse ${isMain ? 'min-h-[500px] lg:min-h-[700px]' : ''}`}>
            <div className="w-full md:w-1/2 bg-foreground/10 aspect-square md:aspect-auto" />
            <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-20 flex flex-col justify-center space-y-8 bg-background">
                <div className="h-4 w-32 bg-primary/20 rounded-md" />
                <div className="h-16 w-full bg-foreground/10 rounded-xl" />
                <div className="space-y-4">
                    <div className="h-4 w-full bg-foreground/5 rounded-md" />
                    <div className="h-4 w-5/6 bg-foreground/5 rounded-md" />
                </div>
                <div className="flex gap-4 pt-6">
                    <div className="h-12 w-32 bg-foreground/10 rounded-xl" />
                    <div className="h-12 w-32 bg-foreground/10 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
