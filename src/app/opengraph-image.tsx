import { ImageResponse } from 'next/og'

export const alt = 'QC - Quality Control for Your Relationship'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #fff1f2, #fce7f3, #fff7ed)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          Q
        </div>
        <span style={{ fontSize: 42, fontWeight: 700, color: '#1f2937' }}>QC</span>
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          background: 'linear-gradient(90deg, #f43f5e, #ec4899, #fb923c)',
          backgroundClip: 'text',
          color: 'transparent',
          lineHeight: 1.2,
          textAlign: 'center',
          maxWidth: 800,
        }}
      >
        Quality Control for Your Relationship
      </div>
      <div
        style={{
          fontSize: 24,
          color: '#6b7280',
          marginTop: 20,
          textAlign: 'center',
          maxWidth: 600,
        }}
      >
        Simple tools to build a stronger relationship together.
      </div>
    </div>,
    { ...size },
  )
}
