'use client';

import React from 'react';
import { can } from '../permissions';
import type { UserProfile } from '../types';

export interface CanProps {
  user: UserProfile | null | undefined;
  capability: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Declarative capability verification wrapper component.
 *
 * Renders children only if `can(user, capability)` returns true.
 * Optional fallback prop is rendered if permission check fails.
 *
 * Example:
 * <Can user={user} capability="ownstay_create_property">
 *   <AddPropertyButton />
 * </Can>
 */
export default function Can({ user, capability, children, fallback = null }: CanProps) {
  if (!can(user, capability)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
