import { useSecretAccess } from '@/hooks/useSecretAccess';

interface SecretTriggerProps {
  type?: 'triple-click' | 'rhythm';
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps content with a secret trigger mechanism.
 * - triple-click: Activates on 3 rapid clicks
 * - rhythm: Activates on short-short-long click pattern
 */
const SecretTrigger = ({ type = 'triple-click', children, className = '' }: SecretTriggerProps) => {
  const { handleSecretClick, handleRhythmClick } = useSecretAccess();

  const handleClick = type === 'rhythm' ? handleRhythmClick : handleSecretClick;

  return (
    <span onClick={handleClick} className={className}>
      {children}
    </span>
  );
};

export default SecretTrigger;
