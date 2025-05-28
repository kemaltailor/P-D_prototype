using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace KonyaKBS.API.Services
{
    public class ImageUploader
    {
        private readonly string _uploadPath;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp" };
        private readonly long _maxFileSize = 5 * 1024 * 1024; // 5MB

        public ImageUploader(IConfiguration configuration)
        {
            _uploadPath = configuration["ImageUploadSettings:UploadPath"] ?? "wwwroot/uploads";
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Dosya boş olamaz.");

            if (file.Length > _maxFileSize)
                throw new ArgumentException($"Dosya boyutu {_maxFileSize / 1024 / 1024}MB'dan büyük olamaz.");

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
                throw new ArgumentException("Sadece JPG, JPEG, PNG, GIF, SVG ve WEBP formatları desteklenmektedir.");

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(_uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // SVG dosyaları için boyutlandırma yapmıyoruz
            if (extension != ".svg")
            {
                using (var image = await Image.LoadAsync(filePath))
                {
                    // Maksimum boyutları belirle
                    var maxWidth = 1920;
                    var maxHeight = 1080;

                    // Boyutlandırma gerekiyorsa yap
                    if (image.Width > maxWidth || image.Height > maxHeight)
                    {
                        image.Mutate(x => x.Resize(new ResizeOptions
                        {
                            Size = new Size(maxWidth, maxHeight),
                            Mode = ResizeMode.Max
                        }));

                        await image.SaveAsync(filePath);
                    }
                }
            }

            return fileName;
        }

        public void DeleteImage(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return;

            var filePath = Path.Combine(_uploadPath, fileName);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
    }
} 