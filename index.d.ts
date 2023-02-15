// allow .html files to be imported
declare module "*.html" {
  const content: string;
  export default content;
}
