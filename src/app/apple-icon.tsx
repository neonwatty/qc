import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        fontSize: 120,
        background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
        color: 'white',
        fontWeight: 700,
      }}
    >
      Q
    </div>,
    { ...size },
  )
}
