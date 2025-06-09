import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const FAQ = () => {
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === 'admin';
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('content')
        .eq('page', 'faq')
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore 'exact one row not found'
        console.error('Error fetching FAQ content:', error);
        toast({
          title: "Klaida",
          description: "Nepavyko gauti D.U.K. turinio.",
          variant: "destructive",
        });
      } else if (data) {
        setContent(data.content || 'Turinys nerastas.');
      } else {
        setContent('Turinys nerastas. Administratorius turi jį pridėti.');
      }
      setIsLoading(false);
    };

    fetchContent();
  }, [toast]);

  const handleEdit = () => {
    setEditContent(content);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('content')
      .update({ content: editContent })
      .eq('page', 'faq');

    if (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko atnaujinti D.U.K. " + error.message,
        variant: "destructive",
      });
    } else {
      setContent(editContent);
      setIsEditing(false);
      toast({
        title: "Išsaugota",
        description: "D.U.K. sėkmingai atnaujintas.",
      });
    }
  };

  const handleCancel = () => {
    setEditContent('');
    setIsEditing(false);
  };

  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mb-6 text-foreground">{line.substring(2)}</h1>;
      } else if (line.startsWith('## Q: ')) {
        return <h3 key={index} className="text-lg font-semibold mb-2 mt-6 text-primary">{line.substring(3)}</h3>;
      } else if (line.startsWith('A: ')) {
        return <p key={index} className="mb-4 text-foreground pl-4">{line.substring(3)}</p>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-8 mb-1 text-foreground">{line.substring(2)}</li>;
      } else if (line.match(/^\d+\./)) {
        return <li key={index} className="ml-8 mb-1 text-foreground">{line}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="mb-2 text-foreground">{line}</p>;
      }
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Dažnai užduodami klausimai</CardTitle>
            {isAdmin && !isEditing && (
              <Button onClick={handleEdit} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Edit size={16} className="mr-2" />
                Redaguoti
              </Button>
            )}
            {isAdmin && isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Save size={16} className="mr-2" />
                  Išsaugoti
                </Button>
                <Button onClick={handleCancel} variant="outline" className="border-border text-foreground hover:bg-muted">
                  <X size={16} className="mr-2" />
                  Atšaukti
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[600px]">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
              </div>
            ) : isEditing ? (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[600px] font-mono border-border focus:border-primary text-foreground"
                placeholder="Įveskite D.U.K. turinį..."
              />
            ) : (
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {formatContent(content)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FAQ;
