/**
 * @desc 通过创建 a 标签下载 blob 文件
 * @param blob blob 文件
 * @param fileName 下载后的文件名
 * @param autoRevoke 是否自动回收 url
 * @returns url
 */
export const downloadBlob = (blob: Blob, fileName: string, autoRevoke: boolean = true) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  if(autoRevoke){
    URL.revokeObjectURL(url);
  }
  return url
}