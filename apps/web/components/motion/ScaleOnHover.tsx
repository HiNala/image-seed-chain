"use client"
import { motion, type HTMLMotionProps } from 'framer-motion'

export function ScaleOnHover(props: HTMLMotionProps<'div'>) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.12 }} {...props} />
  )
}


