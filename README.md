# Certificados CVTE

Aplicação web para gerenciamento e emissão de certificados do **Curso Especializado para Condutores de Veículos de Transporte de Emergência (CVTE)**.

O projeto foi desenvolvido com foco em simplicidade de uso: permite cadastrar condutores, emitir certificados individualmente ou em lote por planilha, gerar arquivos PDF, consultar certificados emitidos, cancelar certificados e realizar backup dos dados.

> **Importante:** esta aplicação funciona localmente no navegador. Não utiliza banco de dados, sistema de login ou autenticação de usuários.

## Funcionalidades

- Dashboard com resumo dos condutores e certificados.
- Cadastro e gerenciamento de condutores.
- Emissão individual de certificados CVTE.
- Emissão em lote utilizando arquivo Excel.
- Numeração automática no formato `001/CVTE/AAAA`.
- Reinício automático da sequência a cada ano.
- Geração de certificado em PDF A4 paisagem.
- Download em ZIP dos certificados emitidos em lote.
- Consulta de certificados pelo código.
- Identificação de certificados ativos e cancelados.
- Cancelamento com registro do motivo.
- Exportação de relatórios em Excel.
- Backup e restauração dos dados locais.
- Tema claro e escuro.
- Configuração dos dados institucionais utilizados no certificado.

## Fluxo de utilização

1. Cadastre um condutor na seção **Condutores** ou informe os dados diretamente durante a emissão.
2. Acesse **Emitir Certificado** para uma emissão individual ou **Emitir por Excel** para vários condutores.
3. Confira os dados e gere o certificado.
4. Utilize **Certificados** para consultar, visualizar, baixar ou cancelar certificados já emitidos.
5. Utilize **Validar Certificado** e informe um código como `001/CVTE/2026` para consultar seu status.

## Dados do condutor

O sistema trabalha principalmente com:

- Nome completo;
- CPF;
- Número de registro/condutor;
- Categoria da CNH;
- E-mail opcional.

CPF e número de registro são limitados a 11 dígitos numéricos. O CPF é apresentado formatado nas telas e no certificado.

## Emissão por Excel

A emissão em lote aceita planilhas com as seguintes informações principais:

| Campo | Exemplo |
| --- | --- |
| nome | JOÃO DA SILVA |
| cpf | 12345678901 |
| numero_registro | 00123456789 |
| categoria_cnh | D |

O importador também reconhece algumas variações de títulos das colunas para facilitar o preenchimento.

Antes da emissão, o sistema verifica campos obrigatórios, quantidade de dígitos, categoria da CNH, registros duplicados na própria planilha e certificados ativos já existentes.

## Certificado CVTE

O certificado utiliza o formato de código:

```text
001/CVTE/2026
002/CVTE/2026
003/CVTE/2026
```

No início de um novo ano, a sequência volta automaticamente para `001`.

O documento apresenta informações como nome do condutor, CPF, número de registro, categoria da CNH, período do curso, carga horária, local/data, instituição, base legal configurada e dados do responsável.

## Armazenamento local

Os dados são armazenados no **localStorage** do navegador. Isso significa que não existe um servidor central responsável por guardar os cadastros.

Por esse motivo, é recomendado utilizar regularmente a função **Backup** do próprio sistema. O arquivo de backup pode ser usado posteriormente para restaurar os dados no navegador.

Limpar os dados do navegador, utilizar outro computador ou outro perfil de navegador não transfere automaticamente os registros existentes.

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- jsPDF
- html2canvas
- SheetJS / XLSX
- Lucide React

## Executando localmente

É necessário ter o Node.js instalado.

Clone o repositório:

```bash
git clone https://github.com/glaydsonaraujo25-cloud/Certificados.git
cd Certificados
```

Instale as dependências:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Para verificar os tipos TypeScript:

```bash
npm run lint
```

Para gerar a versão de produção:

```bash
npm run build
```

A saída de produção será criada na pasta `dist`.

## Estrutura principal

```text
Certificados/
├── public/                 # Brasões e arquivos públicos
├── src/
│   ├── components/         # Componentes reutilizáveis e certificado
│   ├── context/            # Estado e persistência local
│   ├── utils/              # PDF, códigos, armazenamento e utilitários
│   ├── views/              # Telas da aplicação
│   ├── App.tsx             # Navegação principal
│   └── types.ts            # Tipos TypeScript
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Privacidade e arquitetura

A versão atual foi propositalmente mantida simples:

- sem banco de dados;
- sem login;
- sem cadastro de usuários;
- sem API própria;
- sem QR Code;
- sem dependência de serviços de IA.

O processamento e a persistência dos dados utilizados pela interface acontecem no navegador.

## Observação

O sistema auxilia na criação e organização dos certificados conforme o modelo e as configurações cadastradas. O uso do software, por si só, não substitui os procedimentos administrativos, requisitos legais ou validações exigidas pelos órgãos competentes.

## Autor

Desenvolvido por **Glaydson de Araujo Lisboa**.

## Status

Projeto em versão funcional, com foco no fluxo de emissão e gerenciamento de certificados CVTE.
