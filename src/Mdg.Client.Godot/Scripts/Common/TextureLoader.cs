using Godot;
using System;
using System.Collections.Generic;
using System.IO;

namespace Mdg.Client.Godot.Scripts.Common
{
    public static class TextureLoader
    {
        private static readonly Dictionary<string, Texture2D> _cache = new();
        private static bool _initialized = false;

        public static void EnsureAssetsExtracted()
        {
            if (!_initialized)
            {
                _initialized = true;
                AssetSplitter.GenerateAllIndividualAssets();
            }
        }

        public static Texture2D? LoadIndividual(string category, string filename)
        {
            EnsureAssetsExtracted();
            string path = $"res://Assets/Individual/{category}/{filename}";
            return LoadTexture(path, "none");
        }

        public static Texture2D? LoadTexture(string resPath, string keyColor = "none")
        {
            string cacheKey = $"{resPath}_{keyColor}";
            if (_cache.TryGetValue(cacheKey, out var cachedTex))
            {
                return cachedTex;
            }

            Image? image = null;

            // 1. Nạp trực tiếp từ file trên ổ đĩa để tránh lỗi khi Godot Editor chưa import
            string globalPath = ProjectSettings.GlobalizePath(resPath);
            if (File.Exists(globalPath))
            {
                try
                {
                    image = Image.LoadFromFile(globalPath);
                }
                catch (Exception ex)
                {
                    GD.PrintErr($"[TextureLoader] Lỗi khi nạp từ file: {globalPath} - {ex.Message}");
                }
            }

            // 2. Fallback qua ResourceLoader nếu có sẵn trong cache engine
            if (image == null && ResourceLoader.Exists(resPath))
            {
                try
                {
                    var res = GD.Load<Texture2D>(resPath);
                    if (res != null)
                    {
                        if (keyColor == "none")
                        {
                            _cache[cacheKey] = res;
                            return res;
                        }
                        image = res.GetImage();
                    }
                }
                catch { }
            }

            if (image == null)
            {
                GD.PrintErr($"[TextureLoader] Không thể tìm thấy hoặc nạp ảnh từ: {resPath} ({globalPath})");
                return null;
            }

            // 3. Xử lý Chroma-Key tách nền trong suốt (loại bỏ nền trắng hoặc đen)
            if (keyColor == "white" || keyColor == "black")
            {
                image.Convert(Image.Format.Rgba8);
                int width = image.GetWidth();
                int height = image.GetHeight();

                for (int y = 0; y < height; y++)
                {
                    for (int x = 0; x < width; x++)
                    {
                        Color c = image.GetPixel(x, y);
                        if (keyColor == "white")
                        {
                            if (c.R >= 0.86f && c.G >= 0.86f && c.B >= 0.86f)
                            {
                                image.SetPixel(x, y, new Color(c.R, c.G, c.B, 0f));
                            }
                            else if (c.R >= 0.74f && c.G >= 0.74f && c.B >= 0.74f)
                            {
                                float minC = Math.Min(c.R, Math.Min(c.G, c.B));
                                float factor = (1.0f - minC) / (1.0f - 0.74f);
                                image.SetPixel(x, y, new Color(c.R, c.G, c.B, c.A * factor));
                            }
                        }
                        else if (keyColor == "black")
                        {
                            if (c.R <= 0.11f && c.G <= 0.11f && c.B <= 0.11f)
                            {
                                image.SetPixel(x, y, new Color(c.R, c.G, c.B, 0f));
                            }
                            else if (c.R <= 0.22f && c.G <= 0.22f && c.B <= 0.22f)
                            {
                                float maxC = Math.Max(c.R, Math.Max(c.G, c.B));
                                float factor = (maxC - 0.11f) / (0.22f - 0.11f);
                                image.SetPixel(x, y, new Color(c.R, c.G, c.B, c.A * factor));
                            }
                        }
                    }
                }
            }

            var imageTexture = ImageTexture.CreateFromImage(image);
            _cache[cacheKey] = imageTexture;
            return imageTexture;
        }
    }
}
