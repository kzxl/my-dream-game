using System;

namespace Mdg.Core.Features.Maps;

/// <summary>
/// Lightweight deterministic 2D Simplex / Perlin Noise Generator for procedural terrain in Aethelis.
/// Zero external dependencies, pure C# Standard 2.1 / .NET 8.
/// </summary>
public sealed class FastNoiseLite
{
    private readonly int _seed;
    private readonly short[] _perm = new short[512];
    private readonly short[] _permGradIndex = new short[512];

    private static readonly float[] Gradients2D =
    [
        0.13052619f, 0.99144486f,
        0.38268343f, 0.92387953f,
        0.60876143f, 0.79335334f,
        0.79335334f, 0.60876143f,
        0.92387953f, 0.38268343f,
        0.99144486f, 0.13052619f,
        0.99144486f, -0.13052619f,
        0.92387953f, -0.38268343f,
        0.79335334f, -0.60876143f,
        0.60876143f, -0.79335334f,
        0.38268343f, -0.92387953f,
        0.13052619f, -0.99144486f,
        -0.13052619f, -0.99144486f,
        -0.38268343f, -0.92387953f,
        -0.60876143f, -0.79335334f,
        -0.79335334f, -0.60876143f,
        -0.92387953f, -0.38268343f,
        -0.99144486f, -0.13052619f,
        -0.99144486f, 0.13052619f,
        -0.92387953f, 0.38268343f,
        -0.79335334f, 0.60876143f,
        -0.60876143f, 0.79335334f,
        -0.38268343f, 0.92387953f,
        -0.13052619f, 0.99144486f
    ];

    public FastNoiseLite(int seed = 1337)
    {
        _seed = seed;
        InitPermutation();
    }

    private void InitPermutation()
    {
        var source = new short[256];
        for (short i = 0; i < 256; i++) source[i] = i;

        int hashSeed = _seed;
        for (int i = 255; i >= 0; i--)
        {
            hashSeed = hashSeed * 1664525 + 1013904223;
            int r = (int)((uint)hashSeed % (uint)(i + 1));
            (source[i], source[r]) = (source[r], source[i]);
        }

        for (int i = 0; i < 256; i++)
        {
            _perm[i] = _perm[i + 256] = source[i];
            _permGradIndex[i] = _permGradIndex[i + 256] = (short)((source[i] % 12) * 2);
        }
    }

    public float GetNoise(float x, float y)
    {
        const float F2 = 0.36602540378f; // 0.5 * (sqrt(3.0) - 1.0)
        const float G2 = 0.2113248654f;  // (3.0 - sqrt(3.0)) / 6.0

        float s = (x + y) * F2;
        int i = FastFloor(x + s);
        int j = FastFloor(y + s);

        float t = (i + j) * G2;
        float X0 = i - t;
        float Y0 = j - t;
        float x0 = x - X0;
        float y0 = y - Y0;

        int i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; }
        else { i1 = 0; j1 = 1; }

        float x1 = x0 - i1 + G2;
        float y1 = y0 - j1 + G2;
        float x2 = x0 - 1.0f + 2.0f * G2;
        float y2 = y0 - 1.0f + 2.0f * G2;

        int ii = i & 255;
        int jj = j & 255;

        int gi0 = _permGradIndex[ii + _perm[jj]];
        int gi1 = _permGradIndex[ii + i1 + _perm[jj + j1]];
        int gi2 = _permGradIndex[ii + 1 + _perm[jj + 1]];

        float n0, n1, n2;

        float t0 = 0.5f - x0 * x0 - y0 * y0;
        if (t0 < 0) n0 = 0.0f;
        else
        {
            t0 *= t0;
            n0 = t0 * t0 * (Gradients2D[gi0] * x0 + Gradients2D[gi0 + 1] * y0);
        }

        float t1 = 0.5f - x1 * x1 - y1 * y1;
        if (t1 < 0) n1 = 0.0f;
        else
        {
            t1 *= t1;
            n1 = t1 * t1 * (Gradients2D[gi1] * x1 + Gradients2D[gi1 + 1] * y1);
        }

        float t2 = 0.5f - x2 * x2 - y2 * y2;
        if (t2 < 0) n2 = 0.0f;
        else
        {
            t2 *= t2;
            n2 = t2 * t2 * (Gradients2D[gi2] * x2 + Gradients2D[gi2 + 1] * y2);
        }

        return 70.0f * (n0 + n1 + n2); // Returns in range [-1.0, 1.0]
    }

    public float GetFractalNoise(float x, float y, int octaves = 3, float lacunarity = 2.0f, float gain = 0.5f)
    {
        float sum = 0;
        float freq = 1.0f;
        float amp = 1.0f;
        float maxAmp = 0;

        for (int i = 0; i < octaves; i++)
        {
            sum += GetNoise(x * freq, y * freq) * amp;
            maxAmp += amp;
            amp *= gain;
            freq *= lacunarity;
        }

        return sum / maxAmp;
    }

    private static int FastFloor(float f) => f >= 0 ? (int)f : (int)f - 1;
}
