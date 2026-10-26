"use client"
import { QuoteProps } from "@workspace/auth/utils/typescript"
import { motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "use-intl"

const Quote = ({ quote }: { quote?: QuoteProps }) => {
  const reducedMotion = useReducedMotion();
  const t = useTranslations("auth.quote");
  return (
    <div className='relative h-full w-full flex flex-col justify-center items-center overflow-hidden bg-card border-l border-border'>
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />

      <div className="relative z-10 max-w-xl px-12">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <blockquote className='font-display text-5xl md:text-6xl font-medium leading-[1.04] text-foreground mb-10 tracking-[-0.06em] text-balance'>
            {quote?.quote || t("text")}
          </blockquote>

          <div className="flex flex-col gap-1 border-t border-border pt-6">
            <cite className='not-italic text-lg font-semibold tracking-[0.18em] text-foreground'>
              {quote?.author || t("author")}
            </cite>
            <span className='text-xs text-muted-foreground font-semibold uppercase tracking-[0.14em]'>
              {quote?.credential || t("credential")}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Quote