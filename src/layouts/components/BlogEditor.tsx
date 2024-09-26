'use client';

import { useState, useEffect } from 'react';
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import languages from "@/config/language.json";
import './InputContainer.css'
import { ArticleState } from "@/types";
import { getLanguageObj } from "@/lib/languageParser";

export default function BlogEditor({lang}: {lang: string;}) {
  const initialArticleState: ArticleState = {
    title: '',
    description: '',
    categories: '',
    content: '',
    path: '',
    ...Object.fromEntries(languages.map(lang => [`hrefLang${lang.languageName}`, '']))
  };
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [article, setArticle] = useState(initialArticleState);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const pathname = usePathname();
  const language = getLanguageObj(lang);
  useEffect(() => {
      setOrigin(window.location.origin);
      fetchNextFileName();
  }, [language.contentDir, pathname]);

  const fetchNextFileName = async () => {
    try {
      const response = await fetch(`/api/get_blog_next_filename`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lang }),
      });
      if (response.ok) {
        const data = await response.json();
        setFileName(data.nextFileName);
      } else {
        console.error('Failed to fetch next filename');
      }
    } catch (error) {
      console.error('Error fetching next filename:', error);
    }
  };

  const handleCheckboxChange = () => {
      setIsCheckboxChecked(!isCheckboxChecked);
  };

  const updateHrefLang = (languageName: string, value: string) => {
    setArticle(prevArticle => ({
      ...prevArticle,
      [`hrefLang${languageName}`]: value
    }));
  };

  const updateAllHrefLang = (curEditLang: string, value: string) => {
    languages.map((item) => {
      console.log(" ============updateAllHrefLang============ ");
      if(value.includes(origin + "/blog/")) {
        if(!value.includes("blog/" + curEditLang)) {
          if(value.endsWith("/blog/")) {
            updateHrefLang(item.languageName, value + item.languageCode);
          }else{
            updateHrefLang(item.languageName, value);
          }
        }else {
          const positionLangCode = article[`hrefLang${item.languageName}`].indexOf("/" + item.languageCode);
          console.log(" ============updateAllHrefLang============ positionLangCode: " + positionLangCode + " hrefLang: " + article[`hrefLang${item.languageName}`])
          if (positionLangCode !== -1) {
            updateHrefLang(item.languageName, article[`hrefLang${item.languageName}`].substring(0, positionLangCode + 3) + value.substring(positionLangCode + 3));
          }
        }
      }else {
        updateHrefLang(item.languageName, value);
      }
    })
  }

  const handleInputPath = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      const placeholder = event.target.placeholder;
      console.log("handleInputPath called " + placeholder + " with value:", newValue);
      updateAllHrefLang(placeholder, newValue)
  };

  const handleInputFileName = (e: any) => {
    const { name, value } = e.target;
    console.log(" handleInputFileName ---------------- *** " + name + " " + value)
    setFileName(value);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    console.log(" handleInputChange ---------------- *** " + name + " " + value)
    setArticle({ ...article, [name]: value });
  };

  const handleSave = async () => {
    try {
      handleSubmit();
    } catch (error) {
      console.error('Error saving article:', error);
      setError('Failed to save article. Please try again.');
    }
  };

  const handleSubmit = async () => {
    console.log(" handleSubmit ---------------- ***")
    const response = await fetch("/api/save_md", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ article, lang, fileName }),
    });

    if (response.ok) {
      alert('文件已保存到服务器。');
    } else {
      alert('保存文件时出错。');
    }
  };

  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="space-y-4">
      <Input
        name="file name"
        value={fileName}
        onChange={handleInputFileName}
        placeholder="File Name"
      />
      <Input
        name="title"
        value={article.title}
        onChange={handleInputChange}
        placeholder="Blog Title"
      />
      <Input
        name="description"
        value={article.description}
        onChange={handleInputChange}
        placeholder="Blog Description"
      />
      <Input
        name="categories"
        value={article.categories}
        onChange={handleInputChange}
        placeholder="Blog Categories"
      />
      <div>
          <ul className="mb-4">
              <li className="mr-4 inline-block">
              <h4 className="mb-3">
                  {"hrefLang"}
              </h4>
              </li>
              <li className="mr-4 inline-block">
              <input type="checkbox" 
                  id="toggleComponents"
                  style={{ marginLeft: '50px' }} 
                  checked={isCheckboxChecked}
                  onChange={handleCheckboxChange}
              />
              </li>
          </ul>
          <>
            {isCheckboxChecked && 
              (
                <div className="input-container space-y-4">
                  {languages.map((item) => {
                        return (
                          <input key={item.languageCode} type="text" placeholder={item.languageCode} value={article[`hrefLang${item.languageName}`]} onChange={handleInputPath}/>
                        )
                      }
                    )
                  }
                </div>
              )
            }
          </>
      </div>
      <Textarea
        name="content"
        value={article.content}
        onChange={handleInputChange}
        placeholder="Blog Content"
        rows={20}
      />
      <Button onClick={handleSave}>Save Blog</Button>
    </div>
  );
}