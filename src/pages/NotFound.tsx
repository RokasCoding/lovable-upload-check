const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oi! Puslapis nerastas</p>
        <a href="/" className="text-primary hover:text-primary/90 underline">
          Grįžti į pradžią
        </a>
      </div>
    </div>
  );
};

export default NotFound;
