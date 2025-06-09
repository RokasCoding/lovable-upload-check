
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Rules = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  // Default rules content
  const defaultContent = `# Taškų sistemos taisyklės

## Bendrosios nuostatos

1. **Taškų uždarbis**: Taškai skiriami už aktyvų dalyvavimą mokymų veiklose, projektų atlikimą ir kitus pasiekimus.

2. **Taškų vertė**: Kiekvienas taškas turi nustatytą vertę, kuri gali keistis priklausomai nuo programos.

3. **Prizų išsikeitimas**: Sukauptus taškus galima keisti į prizus pagal nustatytą taškų kainą.

## Taškų skyrimo principai

- **Projektų atlikimas**: 10-50 taškų priklausomai nuo sudėtingumo
- **Aktyvus dalyvavimas**: 5-20 taškų už pamokas
- **Papildomi uždaviniai**: 5-30 taškų
- **Bendradarbiavimas**: 10-25 taškų už pagalbą kitiems

## Taškų naudojimo taisyklės

1. Taškai galioja visą programos trukmę
2. Taškų perduoti kitiems negalima
3. Prizų užsakymas vyksta per sistemą
4. Prizų išdavimas koordinuojamas su administracija

## Pažeidimų atvejai

Netinkamas taškų naudojimas ar bandymas manipuliuoti sistema gali lemti taškų praradimą arba pašalinimą iš programos.`;

  useEffect(() => {
    // Load content from localStorage or use default
    const savedContent = localStorage.getItem('rules-content');
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
    localStorage.setItem('rules-content', editContent);
    setIsEditing(false);
    toast({
      title: "Išsaugota",
      description: "Taisyklės sėkmingai atnaujintos.",
    });
  };

  const handleCancel = () => {
    setEditContent('');
    setIsEditing(false);
  };

  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mb-4 text-vcs-black">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold mb-3 mt-6 text-vcs-blue">{line.substring(3)}</h2>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 mb-1">{line.substring(2)}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else if (line.match(/^\d+\./)) {
        return <p key={index} className="mb-2 font-medium">{line}</p>;
      } else {
        return <p key={index} className="mb-2">{line}</p>;
      }
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <Card className="vcs-table">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-vcs-black">Taisyklės</CardTitle>
            {isAdmin && !isEditing && (
              <Button onClick={handleEdit} variant="outline" className="border-vcs-blue text-vcs-blue hover:bg-vcs-blue hover:text-white">
                <Edit size={16} className="mr-2" />
                Redaguoti
              </Button>
            )}
            {isAdmin && isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-vcs-blue hover:bg-vcs-blue/90">
                  <Save size={16} className="mr-2" />
                  Išsaugoti
                </Button>
                <Button onClick={handleCancel} variant="outline">
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
                className="min-h-[600px] font-mono border-vcs-black"
                placeholder="Įveskite taisyklių turinį..."
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

export default Rules;
