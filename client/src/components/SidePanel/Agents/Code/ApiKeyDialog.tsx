import type { UseFormRegister, UseFormHandleSubmit } from 'react-hook-form';
import type { ApiKeyFormData } from '~/common';
import OGDialogTemplate from '~/components/ui/OGDialogTemplate';
import { Input, Button, OGDialog } from '~/components/ui';
import { useLocalize } from '~/hooks';
import type { RefObject } from 'react';

export default function ApiKeyDialog({
  isOpen,
  onSubmit,
  onRevoke,
  onOpenChange,
  isUserProvided,
  isToolAuthenticated,
  register,
  handleSubmit,
  triggerRef,
  triggerRefs,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApiKeyFormData) => void;
  onRevoke: () => void;
  isUserProvided?: boolean;
  isToolAuthenticated: boolean;
  register: UseFormRegister<ApiKeyFormData>;
  handleSubmit: UseFormHandleSubmit<ApiKeyFormData>;
  triggerRef?: RefObject<HTMLButtonElement>;
  triggerRefs?: RefObject<HTMLButtonElement>[];
}) {
  const localize = useLocalize();

  const languageIcons = [
    'python.svg',
    'javascript.svg',
    'typescript.svg',
    'java.svg',
    'cpp.svg',
    'csharp.svg',
    'php.svg',
    'ruby.svg',
    'go.svg',
    'rust.svg',
    'swift.svg',
    'kotlin.svg',
    'scala.svg',
    'r.svg',
    'matlab.svg',
    'perl.svg',
    'lua.svg',
    'bash.svg',
  ];

  return (
    <OGDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      triggerRef={triggerRef}
      triggerRefs={triggerRefs}
    >
      <OGDialogTemplate
        className="w-11/12 sm:w-[500px]"
        title=""
        main={
          <>
            <div className="mb-4 text-center font-medium">{localize('com_nav_tool_code')}</div>
            <div className="mx-auto mb-4 flex max-w-[400px] flex-wrap justify-center gap-3">
              {languageIcons.map((icon) => (
                <div key={icon} className="h-6 w-6">
                  <img
                    src={`/assets/${icon}`}
                    alt=""
                    className="h-full w-full object-contain opacity-[0.85] dark:invert"
                  />
                </div>
              ))}
            </div>
            <a
              href="https://code.librechat.ai/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-[15px] font-medium text-blue-500 underline decoration-1 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {localize('com_nav_get_api_key')}
            </a>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4">
                <Input
                  {...register('apiKey', { required: true })}
                  type="password"
                  placeholder={localize('com_ui_api_key')}
                  className="w-full"
                />
              </div>
              <div className="mt-4 flex justify-between">
                {isToolAuthenticated && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onRevoke}
                    className="text-red-600 hover:text-red-700"
                  >
                    {localize('com_ui_revoke')}
                  </Button>
                )}
                <Button type="submit" className="ml-auto">
                  {localize('com_ui_submit')}
                </Button>
              </div>
            </form>
          </>
        }
      />
    </OGDialog>
  );
}