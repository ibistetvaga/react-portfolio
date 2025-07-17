import { motion } from "framer-motion"
import { useTranslation } from "../contexts/TranslationContext"

const Contact = () => {
  const { t } = useTranslation()

  return (
    <div className="border-b border-neutral-900 pb-20">
        <motion.h2 
        whileInView={{ opacity: 1, x: 0, y: 0 }}
          initial={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.5 }}
        className="my-10 text-center text-4xl">{t('contact.title')}</motion.h2>
        <motion.div 
        whileInView={{ opacity: 1, x: 0, y: 0 }}
            initial={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.5 }}
        className="text-center  tracking-tighter">
            <p className="my-4">{t('contact.address')}</p>
            <p className="my-4">{t('contact.phone')}</p>
            <a href="#" className="border-b">{t('contact.email')}</a>
        </motion.div>
    </div>
  )
}

export default Contact