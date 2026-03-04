'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Users,
  Plus,
  Trash2,
  Save,
  X,
  Lock,
  ChevronDown,
  User,
} from 'lucide-react';
import { getAdminT } from '@/lib/i18n/admin';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TeamRole {
  id: string;
  name: string;
  label_de: string;
  label_ru: string;
  permissions: string[];
  is_system: boolean | null;
  created_at: string | null;
}

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  team_role_id: string | null;
  created_at: string;
  team_roles: TeamRole | null;
}

interface Props {
  members: TeamMember[];
  roles: TeamRole[];
  locale: string;
}

// ---------------------------------------------------------------------------
// Permission definitions (maps to admin sections)
// ---------------------------------------------------------------------------

const PERMISSION_GROUPS = [
  { key: 'dashboard', de: 'Dashboard', ru: 'Панель' },
  { key: 'inbox', de: 'Posteingang', ru: 'Входящие' },
  { key: 'analytics', de: 'Analytics', ru: 'Аналитика' },
  { key: 'customers', de: 'Kunden / CRM', ru: 'Клиенты / CRM' },
  { key: 'leads', de: 'Leads', ru: 'Лиды' },
  { key: 'contacts', de: 'Kontaktanfragen', ru: 'Обращения' },
  { key: 'orders', de: 'Bestellungen', ru: 'Заказы' },
  { key: 'sessions', de: 'Sitzungen', ru: 'Сессии' },
  { key: 'calendar', de: 'Kalender', ru: 'Календарь' },
  { key: 'content', de: 'Content', ru: 'Контент' },
  { key: 'sequences', de: 'Sequenzen', ru: 'Последовательности' },
  { key: 'tags', de: 'Auto-Tags', ru: 'Авто-теги' },
  { key: 'automations', de: 'Automatisierung', ru: 'Автоматизация' },
  { key: 'tasks', de: 'Aufgaben', ru: 'Задачи' },
  { key: 'deals', de: 'Deals', ru: 'Сделки' },
  { key: 'emails', de: 'E-Mail Log', ru: 'Журнал писем' },
  { key: 'coupons', de: 'Gutscheine', ru: 'Купоны' },
  { key: 'team', de: 'Team / RBAC', ru: 'Команда / RBAC' },
];

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const labels = {
  de: {
    title: 'Team & Rollen',
    subtitle: 'Teammitglieder verwalten und Rollen zuweisen.',
    membersTitle: 'Teammitglieder',
    membersCount: 'Admins',
    rolesTitle: 'Rollen',
    roleLabel: 'Rolle',
    noRole: 'Keine Rolle',
    assignRole: 'Rolle zuweisen',
    newRole: 'Neue Rolle',
    roleName: 'Rollenname',
    labelDe: 'Label (DE)',
    labelRu: 'Label (RU)',
    permissions: 'Berechtigungen',
    systemRole: 'System',
    customRole: 'Benutzerdefiniert',
    deleteRole: 'Rolle loschen',
    confirmDelete: 'Wirklich loschen?',
    cannotDeleteSystem: 'System-Rollen konnen nicht geloscht werden.',
    save: 'Speichern',
    cancel: 'Abbrechen',
    saving: 'Speichere...',
    saved: 'Gespeichert!',
    allPermissions: 'Alle Berechtigungen',
    member: 'Mitglied',
    joinedAt: 'Beigetreten',
    editPermissions: 'Berechtigungen bearbeiten',
  },
  ru: {
    title: 'Команда и роли',
    subtitle: 'Управление участниками команды и назначение ролей.',
    membersTitle: 'Участники команды',
    membersCount: 'админов',
    rolesTitle: 'Роли',
    roleLabel: 'Роль',
    noRole: 'Без роли',
    assignRole: 'Назначить роль',
    newRole: 'Новая роль',
    roleName: 'Имя роли',
    labelDe: 'Метка (DE)',
    labelRu: 'Метка (RU)',
    permissions: 'Разрешения',
    systemRole: 'Системная',
    customRole: 'Пользовательская',
    deleteRole: 'Удалить роль',
    confirmDelete: 'Действительно удалить?',
    cannotDeleteSystem: 'Системные роли нельзя удалять.',
    save: 'Сохранить',
    cancel: 'Отмена',
    saving: 'Сохранение...',
    saved: 'Сохранено!',
    allPermissions: 'Все разрешения',
    member: 'Участник',
    joinedAt: 'Присоединился',
    editPermissions: 'Редактировать разрешения',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TeamShell({ members: initialMembers, roles: initialRoles, locale }: Props) {
  const router = useRouter();
  const t = (labels as Record<string, typeof labels.de>)[locale] ?? labels.de;
  const adminT = getAdminT(locale);
  const isDE = locale === 'de';

  const [members, setMembers] = useState(initialMembers);
  const [roles, setRoles] = useState(initialRoles);
  const [saving, setSaving] = useState(false);

  // Role creator
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleLabelDe, setNewRoleLabelDe] = useState('');
  const [newRoleLabelRu, setNewRoleLabelRu] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);

  // Editing role permissions
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingPerms, setEditingPerms] = useState<string[]>([]);

  // Open role dropdown per member
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // -----------------------------------------------------------------------
  // Role assignment
  // -----------------------------------------------------------------------
  async function assignRole(profileId: string, roleId: string | null) {
    setSaving(true);
    setOpenDropdown(null);
    try {
      const res = await fetch('/api/admin/team/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId, team_role_id: roleId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMembers(prev => prev.map(m => m.id === profileId ? updated : m));
      }
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------------------------------------------------
  // Create role
  // -----------------------------------------------------------------------
  async function createRole() {
    if (!newRoleName || !newRoleLabelDe || !newRoleLabelRu) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/team/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleName,
          label_de: newRoleLabelDe,
          label_ru: newRoleLabelRu,
          permissions: newRolePerms,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setRoles(prev => [...prev, created]);
        setShowRoleForm(false);
        setNewRoleName('');
        setNewRoleLabelDe('');
        setNewRoleLabelRu('');
        setNewRolePerms([]);
      }
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------------------------------------------------
  // Delete role
  // -----------------------------------------------------------------------
  async function deleteRole(roleId: string) {
    if (!confirm(t.confirmDelete)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/team/roles/${roleId}`, { method: 'DELETE' });
      if (res.ok) {
        setRoles(prev => prev.filter(r => r.id !== roleId));
        // Refresh members who had this role
        setMembers(prev => prev.map(m =>
          m.team_role_id === roleId ? { ...m, team_role_id: null, team_roles: null } : m
        ));
      }
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------------------------------------------------
  // Update role permissions
  // -----------------------------------------------------------------------
  async function saveRolePermissions(roleId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/team/roles/${roleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: editingPerms }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRoles(prev => prev.map(r => r.id === roleId ? updated : r));
        setEditingRoleId(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------------------------------------------------
  // Toggle permission in a set
  // -----------------------------------------------------------------------
  function togglePerm(perms: string[], key: string, setter: (v: string[]) => void) {
    if (perms.includes(key)) {
      setter(perms.filter(p => p !== key));
    } else {
      setter([...perms, key]);
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Shield className="h-7 w-7 text-gold" strokeWidth={1.5} />
          {t.title}
        </h1>
        <p className="text-white/50 text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Members Section */}
      {/* ----------------------------------------------------------------- */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gold" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-white">{t.membersTitle}</h2>
            <span className="text-xs text-white/40 bg-white/5 rounded-full px-2.5 py-0.5">
              {members.length} {t.membersCount}
            </span>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {members.map(member => {
            const role = member.team_roles;
            const roleLabel = role
              ? (isDE ? role.label_de : role.label_ru)
              : t.noRole;

            return (
              <div key={member.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-gold" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {member.full_name || member.email}
                    </p>
                    {member.full_name && (
                      <p className="text-xs text-white/40 truncate">{member.email}</p>
                    )}
                  </div>
                </div>

                {/* Role dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === member.id ? null : member.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm"
                  >
                    <span className={role ? 'text-gold' : 'text-white/40'}>{roleLabel}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-white/40" strokeWidth={1.5} />
                  </button>

                  {openDropdown === member.id && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
                      <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-white/10 bg-[#0a1e2a] shadow-2xl z-40 py-1 overflow-hidden">
                        {/* No role option */}
                        <button
                          onClick={() => assignRole(member.id, null)}
                          className="w-full text-left px-4 py-2.5 text-sm text-white/50 hover:bg-white/5 transition-colors"
                        >
                          {t.noRole}
                        </button>
                        <div className="border-t border-white/5" />
                        {roles.map(r => (
                          <button
                            key={r.id}
                            onClick={() => assignRole(member.id, r.id)}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center justify-between ${
                              member.team_role_id === r.id ? 'text-gold' : 'text-white/70'
                            }`}
                          >
                            <span>{isDE ? r.label_de : r.label_ru}</span>
                            {r.is_system && (
                              <Lock className="h-3 w-3 text-white/20" strokeWidth={1.5} />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {members.length === 0 && (
            <div className="px-6 py-12 text-center text-white/30 text-sm">
              {adminT.noResults}
            </div>
          )}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Roles Section */}
      {/* ----------------------------------------------------------------- */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-gold" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-white">{t.rolesTitle}</h2>
          </div>
          <button
            onClick={() => setShowRoleForm(!showRoleForm)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/10 text-gold text-sm font-medium hover:bg-gold/20 transition-colors border border-gold/20"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            {t.newRole}
          </button>
        </div>

        {/* New role form */}
        {showRoleForm && (
          <div className="px-6 py-5 border-b border-white/10 bg-white/[0.02] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">{t.roleName}</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  placeholder="e.g. editor"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/40"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">{t.labelDe}</label>
                <input
                  type="text"
                  value={newRoleLabelDe}
                  onChange={e => setNewRoleLabelDe(e.target.value)}
                  placeholder="Redakteur"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/40"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">{t.labelRu}</label>
                <input
                  type="text"
                  value={newRoleLabelRu}
                  onChange={e => setNewRoleLabelRu(e.target.value)}
                  placeholder="Редактор"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/40"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 mb-2 block">{t.permissions}</label>
              <div className="flex flex-wrap gap-2">
                {PERMISSION_GROUPS.map(pg => (
                  <button
                    key={pg.key}
                    onClick={() => togglePerm(newRolePerms, pg.key, setNewRolePerms)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      newRolePerms.includes(pg.key)
                        ? 'bg-gold/10 text-gold border-gold/30'
                        : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {isDE ? pg.de : pg.ru}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={createRole}
                disabled={saving || !newRoleName || !newRoleLabelDe || !newRoleLabelRu}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-40"
              >
                <Save className="h-4 w-4" strokeWidth={1.5} />
                {saving ? t.saving : t.save}
              </button>
              <button
                onClick={() => {
                  setShowRoleForm(false);
                  setNewRoleName('');
                  setNewRoleLabelDe('');
                  setNewRoleLabelRu('');
                  setNewRolePerms([]);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {/* Roles list */}
        <div className="divide-y divide-white/5">
          {roles.map(role => {
            const isEditing = editingRoleId === role.id;
            const isOwner = role.permissions.includes('*');

            return (
              <div key={role.id} className="px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      isOwner ? 'bg-gold/10 border border-gold/20' : 'bg-white/5 border border-white/10'
                    }`}>
                      <Shield className={`h-4 w-4 ${isOwner ? 'text-gold' : 'text-white/40'}`} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {isDE ? role.label_de : role.label_ru}
                        <span className="text-white/20 ml-2 font-mono text-xs">({role.name})</span>
                      </p>
                      <p className="text-xs text-white/30">
                        {role.is_system ? t.systemRole : t.customRole}
                        {' · '}
                        {isOwner
                          ? t.allPermissions
                          : `${role.permissions.length} ${t.permissions.toLowerCase()}`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isOwner && (
                      <button
                        onClick={() => {
                          if (isEditing) {
                            setEditingRoleId(null);
                          } else {
                            setEditingRoleId(role.id);
                            setEditingPerms([...role.permissions]);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                      >
                        {t.editPermissions}
                      </button>
                    )}
                    {!role.is_system && (
                      <button
                        onClick={() => deleteRole(role.id)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title={t.deleteRole}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Permission editor */}
                {isEditing && (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {PERMISSION_GROUPS.map(pg => (
                        <button
                          key={pg.key}
                          onClick={() => togglePerm(editingPerms, pg.key, setEditingPerms)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            editingPerms.includes(pg.key)
                              ? 'bg-gold/10 text-gold border-gold/30'
                              : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {isDE ? pg.de : pg.ru}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => saveRolePermissions(role.id)}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-40"
                      >
                        <Save className="h-4 w-4" strokeWidth={1.5} />
                        {saving ? t.saving : t.save}
                      </button>
                      <button
                        onClick={() => setEditingRoleId(null)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition-colors"
                      >
                        <X className="h-4 w-4" strokeWidth={1.5} />
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                )}

                {/* Permission tags (read-only view when not editing) */}
                {!isEditing && !isOwner && role.permissions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {role.permissions.map(p => {
                      const pg = PERMISSION_GROUPS.find(g => g.key === p);
                      return (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-white/5 text-white/30 border border-white/5"
                        >
                          {pg ? (isDE ? pg.de : pg.ru) : p}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
