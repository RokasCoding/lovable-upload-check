import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FAQ = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  // Default FAQ content
  const defaultContent = `# Dažnai užduodami klausimai (D.U.K.)

## Q: Kaip užsidirbti taškų?
A: Taškai skiriami už:
- Aktyvų dalyvavimą pamokose
- Projektų atlikimą laiku
- Papildomų užduočių sprendimą
- Pagalbą kitiems studentams
- Dalyvavimą renginuose

## Q: Kiek taškų reikia prizui?
A: Prizų taškų kainos skiriasi:
- Maži prizai: 50-100 taškų
- Vidutiniai prizai: 100-300 taškų
- Dideli prizai: 300+ taškų

## Q: Ar taškai "senėja"?
A: Ne, taškai galioja visą programos trukmę ir nesenėja.

## Q: Ar galiu perduoti taškus kitam studentui?
A: Ne, taškų perduoti negalima. Kiekvienas studentas kaupia taškus individualiai.

## Q: Kaip užsisakyti prizą?
A: Prizą galite užsisakyti per sistemą:
1. Eikite į "Prizai" skyrių
2. Pasirinkite norimą prizą
3. Spauskite "Užsisakyti"
4. Sulauksite patvirtinimo

## Q: Kiek laiko užtrunka prizo išdavimas?
A: Paprastai prizai išduodami per 1-2 darbo dienas po užsakymo patvirtinimo.

## Q: Ką daryti, jei taškų skaičius neteisingas?
A: Kreipkitės į dėstytoją arba administratorių. Jie patikrina ir ištaiso klaidą.

## Q: Ar galiu matyti savo taškų istoriją?
A: Taip, eikite į "Istorija" skyrių, kur matysite visą taškų gavimo istoriją.

## Q: Kas nutiks su taškais po programos pabaigos?
A: Po programos pabaigos taškai nebeveiks, todėl rekomenduojame juos išnaudoti laiku.`;

  useEffect(() => {
    // Load content from localStorage or use default
    const savedContent = localStorage.getItem('faq-content');
    if (savedContent) {
      setContent(savedContent);
    } else {
      setContent(defaultContent);
    }
  }, []);

  const handleEdit = () => {
    setEditContent(content);
    setIsEditing(true);
  };

  const handleSave = () => {
    setContent(editContent);
    localStorage.setItem('faq-content', editContent);
    setIsEditing(false);
    toast({
      title: "Išsaugota",
      description: "D.U.K. sėkmingai atnaujintas.",
    });
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
            {isEditing ? (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[600px] font-mono border-border focus:border-primary text-foreground"
                placeholder="Įveskite D.U.K. turinį..."
              />
            ) : (
              <div className="prose prose-lg max-w-none">
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
