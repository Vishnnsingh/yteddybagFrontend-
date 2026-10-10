export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-[#F3F4F6] mt-auto">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-6 text-center text-sm text-[#6B7280]">
        &copy; {new Date().getFullYear()} YTeddybags. All rights reserved.
      </div>
    </footer>
  );
}
