"use client";
import { motion } from "motion/react";
import FadeIn from "../FadeIn";
import { BentoGrid, BentoItem } from "../ui/Bento";
import TournamentList from "./TournamentList";
import { Tournament } from "../../tournaments/types";

interface TournamentHeroProps {
    tournaments: Tournament[];
    canManage?: boolean;
}

export default function TournamentHero({ tournaments, canManage }: TournamentHeroProps) {
    return (
        <section>
            <FadeIn>
                <BentoGrid>
                    <BentoItem colSpan={4} rowSpan={2} className="min-h-[500px]">
                        <TournamentList 
                            tournaments={tournaments} 
                            variant="bento" 
                            canManage={canManage}
                        />
                    </BentoItem>
                </BentoGrid>
            </FadeIn>
        </section>
    );
}
