'use client';

import { Button } from '@/components/ui/button';
import { X, CircleCheck } from 'lucide-react';
import { Divider } from '@heroui/divider';
import Image from 'next/image';
interface WelcomeCardProps {
  onClose: () => void;
}

export default function WelcomeCard({ onClose }: WelcomeCardProps) {
  const features = [
    { title: 'Pomodoro timer', description: '' },
    { title: 'Custom sounds', description: '' },
    { title: '+10 Scenes', description: '' },
    { title: 'Daily Tasks', description: '' },
    { title: 'Calendar', description: '' },
    { title: 'PDF Reader', description: '' },
    { title: 'Custom playlists', description: '' },
    { title: 'Insights', description: '' },
    { title: 'Notes', description: '' },
    { title: 'YT Player', description: '' },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[200] p-12">
      <div className=" w-full relative max-w-xs">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-orange-500 to-stone-400 transform scale-[0.90] bg-red-500 rounded-full blur-3xl" />
        <div className="relative shadow-large bg-black/80 backdrop-blur-md p-[1px] rounded-2xl max-w-sm w-full">
          <div className=" rounded-2xl text-white">
            <div className="relative p-6">
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 text-gray-400 hover:text-white hover:bg-white/20 rounded-full"
                onClick={onClose}
              >
                <X className="h-2 w-2" />
              </Button>

              <div className="mb-6 -mx-6 -mt-6 rounded-t-2xl overflow-hidden">
                <Image
                  src="/welcome.png"
                  alt="Welcome header"
                  className="w-full h-40 object-cover"
                  width={180}
                  height={40}
                  priority={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-1">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-1 items-start">
                    <CircleCheck className="pt-1 h-5 w-5 text-[#ffffff]" />
                    <div>
                      <span className="text-sm font-medium">{feature.title}</span>
                      {feature.description && (
                        <span className="text-xs text-gray-400 block">{feature.description}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Divider className="my-4" />
              <div className="mt-4 text-center">
                <p className="text-xs font-medium text-white mb-3">Utilizado por estudiantes de:</p>
                <div className="flex justify-center items-center gap-1">
                  <Image
                    src="/utn.png"
                    alt="UTN Logo"
                    className="h-12 w-auto"
                    width={20}
                    height={20}
                  />
                  <Image
                    src="/ucp.png"
                    alt="UCP Logo"
                    className="h-12 w-auto"
                    width={20}
                    height={20}
                  />
                  <Image
                    src="/uncaus.png"
                    alt="UNCAUS Logo"
                    className="h-12 w-auto"
                    width={20}
                    height={20}
                  />
                  <Image
                    src="/unne.png"
                    alt="UNNE Logo"
                    className="h-12 w-auto"
                    width={20}
                    height={20}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
