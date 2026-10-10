import { motion } from 'framer-motion';

export default function DashboardHome() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#111827] tracking-tight">
          Coming <span className="text-[#D26900]">Soon</span>
        </h1>
      </motion.div>
    </div>
  );
}
