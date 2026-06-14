export default function Footer() {
    return (
        <footer className="border-t py-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} PropertyHub
        </footer>
    );
}