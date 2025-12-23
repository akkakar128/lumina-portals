const Footer = () => {
  return (
    <footer className="relative py-8 border-t border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-lg font-bold tracking-wider text-foreground/80">
            PORTFOLIO_
          </div>
          
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} All rights reserved. Built with passion.
          </p>

          <div className="font-mono text-xs text-muted-foreground">
            <span className="text-primary">{'<'}</span>
            designed with love
            <span className="text-primary">{'/>'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
