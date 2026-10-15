import LatticeLoader from './LatticeLoader';

export default function PageLoader({ label = 'Loading' }) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
      }}
    >
      <LatticeLoader label={label} showTimer={false} />
    </div>
  );
}
