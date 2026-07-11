# Guia de Implantação na Vercel 🚀

Este projeto é uma aplicação baseada em **Next.js**, o que torna o processo de deploy na Vercel extremamente simples e direto. A Vercel possui suporte nativo e otimizado para Next.js.

Fizemos uma adaptação no arquivo [next.config.ts](file:///Users/kokimoto/Documents/SPOTFY/SPOTFY/next.config.ts) para garantir que a build standalone seja usada apenas fora da Vercel, mantendo a compatibilidade local e com o ambiente do AI Studio, enquanto permite que a Vercel otimize a build nativamente.

Abaixo estão os dois métodos principais para implantar o seu projeto na Vercel:

---

## Método 1: Vinculando com o GitHub (Recomendado)

Esta é a melhor opção porque ativa o **Deploy Contínuo (CI/CD)**. Cada vez que você fizer um `git push` para a sua branch principal, a Vercel fará uma nova build e atualizará o site automaticamente.

### Passo a Passo:
1. **Suba o projeto para o GitHub**:
   Se você ainda não fez isso, inicialize o git no projeto, crie um repositório no GitHub e envie o código:
   ```bash
   git init
   git add .
   git commit -m "feat: preparar para deploy na vercel"
   # Siga as instruções do GitHub para associar o repositório remoto e fazer o push
   ```

2. **Acesse a Vercel**:
   - Vá para [vercel.com](https://vercel.com) e faça login (pode usar sua conta do GitHub).

3. **Importe o Repositório**:
   - No painel da Vercel, clique no botão **"Add New..."** e selecione **"Project"**.
   - Conecte sua conta do GitHub (se ainda não estiver conectada) e selecione o repositório deste projeto.

4. **Configurações do Projeto**:
   - A Vercel detectará automaticamente que o framework é **Next.js** e preencherá as configurações de build (`next build`) e diretório de saída.
   - **Variáveis de Ambiente (opcional)**: Se seu aplicativo utiliza chaves de API (como a `GEMINI_API_KEY`), expanda a seção **Environment Variables** e adicione-as.
     - **Chave**: `GEMINI_API_KEY`
     - **Valor**: *Sua chave de API do Gemini*
     - **Chave**: `APP_URL`
     - **Valor**: *A URL de produção do seu app na Vercel* (você também pode configurar isso após a primeira build).

5. **Deploy**:
   - Clique em **"Deploy"**. O processo levará cerca de 1 a 2 minutos. Uma vez concluído, você receberá um link de produção (ex: `seu-projeto.vercel.app`).

---

## Método 2: Usando a Vercel CLI (Linha de Comando)

Se você preferir implantar diretamente do seu terminal sem passar pelo GitHub:

### Passo a Passo:
1. **Instale a CLI da Vercel** globalmente (caso não tenha instalado):
   ```bash
   npm install -g vercel
   ```

2. **Inicie o deploy**:
   No diretório raiz do projeto, execute o comando:
   ```bash
   vercel
   ```

3. **Responda às perguntas no terminal**:
   - `Set up and deploy ...?` -> Digite `y` (Sim).
   - `Which scope do you want to deploy to?` -> Escolha sua conta pessoal.
   - `Link to existing project?` -> Digite `N` (Não, pois é um novo projeto).
   - `What’s your project’s name?` -> Pressione `Enter` para aceitar o padrão ou digite um novo nome.
   - `In which directory is your code located?` -> Pressione `Enter` para usar o diretório atual `./`.
   - `Want to modify these settings?` -> Digite `N` (Não, pois as configurações padrão do Next.js já são ideais).

4. **Deploy de Produção**:
   O comando acima cria uma build de *Preview*. Para gerar a build final de produção e obter o domínio oficial, rode:
   ```bash
   vercel --prod
   ```

---

## Verificação e Práticas Recomendadas

- **Build de Teste**: Executamos com sucesso um teste de build local com `npm run build` e o projeto compilou perfeitamente sem erros de TypeScript ou linting, o que garante que a build na Vercel também será bem-sucedida.
- **Variáveis de Ambiente**: Lembre-se de nunca subir arquivos `.env` ou `.env.local` para o repositório git público. Use o painel de configurações da Vercel para gerenciar segredos de forma segura.
