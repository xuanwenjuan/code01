package com.spindle.manage.config;

import com.spindle.manage.entity.SysPermission;
import com.spindle.manage.entity.SysRole;
import com.spindle.manage.entity.SysRolePermission;
import com.spindle.manage.entity.SysUser;
import com.spindle.manage.mapper.SysPermissionMapper;
import com.spindle.manage.mapper.SysRoleMapper;
import com.spindle.manage.mapper.SysRolePermissionMapper;
import com.spindle.manage.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SysRoleMapper roleMapper;
    private final SysPermissionMapper permissionMapper;
    private final SysRolePermissionMapper rolePermissionMapper;
    private final SysUserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("开始初始化系统数据...");

        initRoles();
        initPermissions();
        initRolePermissions();
        initAdminUser();

        log.info("系统数据初始化完成");
    }

    private void initRoles() {
        List<String> roleCodes = Arrays.asList("ADMIN", "PURCHASE", "TECHNOLOGY", "PRODUCTION", "QUALITY");
        List<String> roleNames = Arrays.asList("系统管理员", "采购专员", "机加工工艺员", "产线组长", "精度质检员");

        for (int i = 0; i < roleCodes.size(); i++) {
            String roleCode = roleCodes.get(i);
            if (roleMapper.selectOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysRole>()
                    .eq(SysRole::getRoleCode, roleCode)) == null) {
                SysRole role = new SysRole();
                role.setRoleCode(roleCode);
                role.setRoleName(roleNames.get(i));
                role.setStatus(1);
                role.setCreateTime(LocalDateTime.now());
                roleMapper.insert(role);
                log.info("创建角色：{}", roleName);
            }
        }
    }

    private void initPermissions() {
        String[][] permissions = {
                {"category:list", "分类列表", "category"},
                {"category:get", "分类详情", "category"},
                {"category:add", "新增分类", "category"},
                {"category:update", "更新分类", "category"},
                {"category:delete", "删除分类", "category"},

                {"material:list", "原料列表", "material"},
                {"material:get", "原料详情", "material"},
                {"material:add", "新增原料", "material"},
                {"material:update", "更新原料", "material"},
                {"material:delete", "删除原料", "material"},
                {"material:in", "原料入库", "material"},
                {"material:out", "原料出库", "material"},
                {"material:query", "原料多条件查询", "material"},

                {"production:list", "工单列表", "production"},
                {"production:get", "工单详情", "production"},
                {"production:create", "创建工单", "production"},
                {"production:process", "工序操作", "production"},
                {"production:quality", "工序质检", "production"},
                {"production:pause", "暂停工单", "production"},
                {"production:resume", "恢复工单", "production"},
                {"production:cancel", "取消工单", "production"},
                {"production:material", "工单物料管理", "production"},
                {"production:loss", "生产损耗记录", "production"},
                {"production:query", "工单多条件查询", "production"},

                {"cost:calculate", "成本核算", "cost"},
                {"cost:summary", "成本汇总", "cost"},
                {"cost:category", "分类成本", "cost"},
                {"cost:loss", "损耗查询", "cost"},

                {"user:list", "用户列表", "user"},
                {"user:get", "用户详情", "user"},
                {"user:add", "新增用户", "user"},
                {"user:update", "更新用户", "user"},
                {"user:delete", "删除用户", "user"},

                {"role:list", "角色列表", "role"},
                {"role:get", "角色详情", "role"},
                {"role:add", "新增角色", "role"},
                {"role:update", "更新角色", "role"},
                {"role:delete", "删除角色", "role"},

                {"log:list", "操作日志", "log"},
        };

        for (String[] perm : permissions) {
            String permissionCode = perm[0];
            if (permissionMapper.selectOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysPermission>()
                    .eq(SysPermission::getPermissionCode, permissionCode)) == null) {
                SysPermission permission = new SysPermission();
                permission.setPermissionCode(permissionCode);
                permission.setPermissionName(perm[1]);
                permission.setResourceType(perm[2]);
                permission.setStatus(1);
                permission.setCreateTime(LocalDateTime.now());
                permissionMapper.insert(permission);
                log.info("创建权限：{}", permissionCode);
            }
        }
    }

    private void initRolePermissions() {
        String[][] rolePerms = {
                {"ADMIN", "ALL_PERMISSIONS"},
                {"PURCHASE", "category:list,category:get,material:list,material:get,material:add,material:update,material:in,material:out,material:query"},
                {"TECHNOLOGY", "category:list,category:get,production:list,production:get,production:create,production:query"},
                {"PRODUCTION", "production:list,production:get,production:process,production:pause,production:resume,production:material,production:loss"},
                {"QUALITY", "production:list,production:get,production:quality,production:loss,cost:list,cost:get"}
        };

        for (String[] rp : rolePerms) {
            String roleCode = rp[0];
            SysRole role = roleMapper.selectOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysRole>()
                    .eq(SysRole::getRoleCode, roleCode));
            if (role == null) continue;

            if (!"ALL_PERMISSIONS".equals(rp[1])) {
                String[] perms = rp[1].split(",");
                for (String permCode : perms) {
                    SysPermission perm = permissionMapper.selectOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysPermission>()
                            .eq(SysPermission::getPermissionCode, permCode));
                    if (perm == null) continue;

                    if (rolePermissionMapper.selectOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysRolePermission>()
                            .eq(SysRolePermission::getRoleId, role.getId())
                            .eq(SysRolePermission::getPermissionId, perm.getId())) == null) {
                        SysRolePermission rolePermission = new SysRolePermission();
                        rolePermission.setRoleId(role.getId());
                        rolePermission.setPermissionId(perm.getId());
                        rolePermissionMapper.insert(rolePermission);
                        log.info("角色{}分配权限：{}", roleCode, permCode);
                    }
                }
            } else {
                List<SysPermission> allPerms = permissionMapper.selectList(null);
                for (SysPermission perm : allPerms) {
                    if (rolePermissionMapper.selectOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysRolePermission>()
                            .eq(SysRolePermission::getRoleId, role.getId())
                            .eq(SysRolePermission::getPermissionId, perm.getId())) == null) {
                        SysRolePermission rolePermission = new SysRolePermission();
                        rolePermission.setRoleId(role.getId());
                        rolePermission.setPermissionId(perm.getId());
                        rolePermissionMapper.insert(rolePermission);
                        log.info("角色{}分配权限：{}", roleCode, perm.getPermissionCode());
                    }
                }
            }
        }
    }

    private void initAdminUser() {
        if (userMapper.selectOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, "admin")) == null) {
            SysRole adminRole = roleMapper.selectOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysRole>()
                    .eq(SysRole::getRoleCode, "ADMIN"));

            SysUser admin = new SysUser();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRealName("系统管理员");
            admin.setEmail("admin@spindle.com");
            admin.setPhone("13800138000");
            admin.setRoleId(adminRole.getId());
            admin.setStatus(1);
            admin.setCreateTime(LocalDateTime.now());
            userMapper.insert(admin);
            log.info("创建管理员用户：admin");
        }
    }

}
