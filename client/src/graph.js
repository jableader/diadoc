export default {
    pathForId(id) {
        if (id.path === undefined) {
            console.log("Invalid id's path requested", id);
            return id;
        }

        return id.path;
    },

    idForPath(path) {
        if (typeof(path) != 'string') {
            console.log("Invalid path's ID requested", path);
            return path;
        }
        
        return { path };
    },

    join(root, child) {
        return this.idForPath(this.pathForId(root) + '/' + child);
    },

    getNode(root, id) {
        return id.path.substring(1).split('/').reduce((l, r) => l[r], root)
    },

    getParent(id) {
        if (id.path == '')
            return null;

        return this.idForPath(id.path.slice(0, id.path.lastIndexOf('/')));
    },

    eq(a, b) {
        return a.path == b.path;
    },

    roots(id) {
        const ids = [];
        const parts = id.path.split('/');
        parts.shift(); // Remove empty root

        let visited = '';
        for (var sub of parts) {
            visited += '/' + sub;
            ids.push(this.idForPath(visited));
        }

        return ids;
    },

    getRelated(root, id) {
        if (!id) {
            return []
        }

        var parent = this.getParent(id);
        
        var results = [];
        if (parent?.path && parent.path != '/') {
            results.push(parent);
        }

        var node = this.getNode(root, id);
        for (const child in node) {
            if (child != '__meta')
                results.push(this.idForPath(id.path + '/' + child));
        }

        const links = node['__meta']?.links?.map(l => this.idForPath(l.to)) ?? [];
        return results.concat(links);
    },

    closestPath(paths, id) {
        let binarySearch = function (arr, x, start, end) { // God I love stack overflow
            if (start > end) return ;
            
            let mid=Math.floor((start + end)/2);
            
            if (arr[mid]===x) return true;
                    
            if(arr[mid] > x)
                return binarySearch(arr, x, start, mid-1);
            else
                return binarySearch(arr, x, mid+1, end);
        }

        paths.sort();
        let parts = id.path.substring(1).split('/');
        while (parts.length > 0 && !binarySearch(paths, '/' + parts.join('/'), 0, paths.length)) {
            parts.pop();
        }

        return '/' + parts.join('');
    },

    walk(n, f) { // Calls f(id, node) for full tree, skipping __meta nodes. Return false to not enumerate children of id
        function __walk(path, node) {
            if (f(this.idForPath(path), node)) {
                for (var name in node)
                    if (typeof(node[name]) == 'object' && name != '__meta')
                        __walk.call(this, path + '/' + name, node[name]);
            }
        }

        __walk.call(this, '', n);
    },

    friendlyId(id) {
        return id.path;
    },
}