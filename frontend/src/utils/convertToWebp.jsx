const convertToWebp = ({ file, maxSize = 1024, quality = 0.8 }) => {
  return new Promise((resolve, reject) => {
    if (file.type === "image/webp") {
      resolve(file);
      return;
    }

    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // resize manteniendo proporción
      if (width > maxSize || height > maxSize) {
        const scale = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject();

          const webpFile = new File(
            [blob],
            file.name.replace(/\.\w+$/, ".webp"),
            { type: "image/webp" }
          );

          resolve(webpFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = reject;
    img.src = url;
  });
}

export default convertToWebp;
