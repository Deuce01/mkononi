export default function Footer() {
    return (
      <footer className="bg-card border-t">
        <div className="container mx-auto flex h-16 items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Mkononi Connect. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }
  