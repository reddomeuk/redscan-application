
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAction } from '@/components/hooks/useAction';
import { Loader2 } from 'lucide-react';

const ActionButton = ({
  actionFn,
  children,
  confirm,
  successToast,
  errorToast,
  isLongRunning,
  taskName,
  disabledReason,
  className,
  variant,
  size,
  ...props
}) => {
  const { execute, isLoading } = useAction(actionFn, {
    confirm,
    successToast,
    errorToast,
    isLongRunning,
    taskName,
  });
  
  const isDisabled = isLoading || !!disabledReason;

  const buttonContent = isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Please wait
    </>
  ) : (
    children
  );

  return (
    <Button
      onClick={() => execute(props)}
      disabled={isDisabled}
      className={className}
      variant={variant}
      size={size}
    >
      {buttonContent}
    </Button>
  );
};

export default ActionButton;
