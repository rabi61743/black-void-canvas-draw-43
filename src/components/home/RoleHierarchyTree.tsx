import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tree, TreeNode } from 'react-organizational-chart';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface RoleNode {
  id: number;
  role_name: string;
  parent: number | null;
  permissions?: string[];
  children?: RoleNode[];
}

const RoleHierarchyTree: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [roles, setRoles] = useState<RoleNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const treeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('${import.meta.env.VITE_API_BASE_URL}/api/users/roles/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch roles');
        }

        const data = await response.json();
        // Transform flat list into hierarchical structure
        const roleMap = new Map<number, RoleNode>();
        data.forEach((role: RoleNode) => {
          role.children = [];
          roleMap.set(role.id, role);
        });

        const hierarchy: RoleNode[] = [];
        roleMap.forEach((role) => {
          if (role.parent === null) {
            hierarchy.push(role);
          } else {
            const parent = roleMap.get(role.parent);
            if (parent) {
              parent.children!.push(role);
            }
          }
        });

        setRoles(hierarchy);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load role hierarchy",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [token, toast]);

  useEffect(() => {
    // Estimate scale based on number of nodes
    if (roles.length > 0) {
      const totalNodes = roles.reduce((acc, role) => acc + (role.children?.length || 0) + 1, 0);
      const estimatedWidth = totalNodes * 120; // Approx. node width
      const viewportWidth = window.innerWidth * 0.85; // 85% of viewport
      const newScale = Math.min(1, viewportWidth / estimatedWidth);
      setScale(newScale > 0.4 ? newScale : 0.4); // Minimum scale 0.4
    }
  }, [roles]);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 1.2));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.4));

  const renderTreeNode = (node: RoleNode) => (
    <TreeNode
      label={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-1 rounded-lg shadow-md text-xs font-medium hover:from-blue-600 hover:to-indigo-600 transition-colors duration-200 max-w-[100px] truncate">
                {node.role_name}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">{node.role_name}</p>
              {node.permissions && node.permissions.length > 0 ? (
                <ul className="list-disc pl-4">
                  {node.permissions.map((perm, index) => (
                    <li key={index} className="text-sm">{perm}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm">No permissions</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    >
      {node.children?.map((child) => renderTreeNode(child))}
    </TreeNode>
  );

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading hierarchy...</div>;
  }

  return (
    <Card className="w-full max-w-[95vw] mx-auto mt-8 bg-white shadow-xl rounded-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
        <CardTitle className="text-2xl font-bold">Role Hierarchy</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-end gap-2 mb-4">
          <Button onClick={handleZoomIn} size="sm" className="bg-blue-500 hover:bg-blue-600">
            Zoom In
          </Button>
          <Button onClick={handleZoomOut} size="sm" className="bg-blue-500 hover:bg-blue-600">
            Zoom Out
          </Button>
        </div>
        {roles.length > 0 ? (
          <div className="relative w-full h-[80vh] overflow-y-auto overflow-x-hidden">
            <div
              ref={treeRef}
              className="w-full"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                padding: '20px',
              }}
            >
              <Tree
                lineWidth={'1px'}
                lineColor={'#2563eb'}
                lineBorderRadius={'6px'}
                label={
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-lg shadow-lg text-sm font-semibold">
                    {roles[0].role_name}
                  </div>
                }
                nodePadding={'4px'}
              >
                {roles[0].children?.map((child) => renderTreeNode(child))}
              </Tree>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No roles found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleHierarchyTree;