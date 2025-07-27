import { useState } from 'react';
import { AuthType } from 'librechat-data-provider';
import type { SearchApiKeyFormData } from '~/hooks/Plugins/useAuthSearchTool';
import type { UseFormRegister, UseFormHandleSubmit } from 'react-hook-form';
import OGDialogTemplate from '~/components/ui/OGDialogTemplate';
import { Input, Button, OGDialog, Dropdown } from '~/components/ui';
import { useLocalize } from '~/hooks';
import type { RefObject } from 'react';

export default function ApiKeyDialog({
  isOpen,
  onSubmit,
  onRevoke,
  onOpenChange,
  authTypes,
  isToolAuthenticated,
  register,
  handleSubmit,
  triggerRef,
  triggerRefs,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SearchApiKeyFormData) => void;
  onRevoke: () => void;
  authTypes: [string, AuthType][];
  isToolAuthenticated: boolean;
  register: UseFormRegister<SearchApiKeyFormData>;
  handleSubmit: UseFormHandleSubmit<SearchApiKeyFormData>;
  triggerRef?: RefObject<HTMLInputElement | HTMLButtonElement>;
  triggerRefs?: RefObject<HTMLInputElement | HTMLButtonElement>[];
}) {
  const localize = useLocalize();
  const [selectedProvider, setSelectedProvider] = useState('serper');

  const providers = [
    { key: 'serper', label: 'Serper' },
    { key: 'searxng', label: 'SearXNG' },
  ];

  const handleProviderChange = (key: string) => {
    setSelectedProvider(key);
  };

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
            <div className="mb-4 text-center font-medium">Web Search Tool</div>
            <div className="mx-auto mb-4 flex max-w-[400px] flex-wrap justify-center gap-3">
              <div className="h-6 w-6">
                <svg viewBox="0 0 24 24" className="h-full w-full object-contain opacity-[0.85]">
                  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">Search Provider</label>
                <Dropdown
                  value={selectedProvider}
                  onChange={handleProviderChange}
                  options={providers}
                  className="w-full"
                />
              </div>

              {selectedProvider === 'serper' && (
                <div className="mb-4">
                  <Input
                    {...register('serperApiKey', { required: true })}
                    type="password"
                    placeholder="Serper API Key"
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Get your API key from{' '}
                    <a
                      href="https://serper.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      serper.dev
                    </a>
                  </p>
                </div>
              )}

              {selectedProvider === 'searxng' && (
                <>
                  <div className="mb-4">
                    <Input
                      {...register('searxngInstanceUrl', { required: true })}
                      type="text"
                      placeholder="SearXNG Instance URL"
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <Input
                      {...register('searxngApiKey')}
                      type="password"
                      placeholder="SearXNG API Key (optional)"
                      className="w-full"
                    />
                  </div>
                </>
              )}

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