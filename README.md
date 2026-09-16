# SHARK — Landing page

Landing page de MMA, Boxe e Muay Thai em Indaiatuba. React, TypeScript e Vite, com fotografias e fontes locais.

## Rodar no PowerShell

```powershell
cd "C:\Users\Guilherme Moraes\Desktop\LPs\shark-lutas"
npm install
npm run dev
```

Abra http://localhost:3000. Não é necessário configurar uma chave de API.

## Verificações

```powershell
npm run lint
npm run build
```

A versão de produção é criada em `dist`. Para conferir essa versão, execute `npm run preview`.

## Arquivos principais

- `src/Campaign.tsx`: conteúdo, menu, modalidades, vídeo e links de contato.
- `src/campaign.css`: identidade editorial, tipografia e responsividade.
- `src/EditorialGallery.tsx` e `src/EditorialGallery.css`: galeria e ampliação das fotos.
- `public/images`: logo, retratos e quadros extraídos dos vídeos do Shark.
- `public/carrosel`: fotografias dos alunos.
- `public/fonts`: Anton e Barlow, com suas licenças de uso.

Os contatos estão definidos no início de `Campaign.tsx`. O vídeo da home toca automaticamente em cores, sem som e em looping; as modalidades também usam vídeos sem som em looping. A seção Sobre usa uma fotografia de fundo. Não há serviços externos de fontes ou imagens necessários à página.

## Publicação

Use `npm run build` e publique o conteúdo de `dist` em uma hospedagem de sites estáticos. O redesign foi validado localmente; a publicação deve ser feita separadamente.

# shark-team
