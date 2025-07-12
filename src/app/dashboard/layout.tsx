
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80]">
                <Sidebar />
            </div>
            <main className="transition-all duration-300 md:pl-60 group-[.sidebar-collapsed]/sidebar:md:pl-16">
                <Header />
                {children}
            </main>
        </div>
    );
} 