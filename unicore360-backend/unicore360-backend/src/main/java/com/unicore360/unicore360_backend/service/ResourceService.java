package com.unicore360.unicore360_backend.service;

import com.unicore360.unicore360_backend.model.Resource;
import com.unicore360.unicore360_backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id).orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, Resource resourceDetails) {
        Resource resource = getResourceById(id);
        resource.setName(resourceDetails.getName());
        resource.setType(resourceDetails.getType());
        resource.setCapacity(resourceDetails.getCapacity());
        resource.setLocation(resourceDetails.getLocation());
        resource.setStatus(resourceDetails.getStatus());
        return resourceRepository.save(resource);
    }

    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }

    // Search/filter (you can extend with dynamic queries)
    public List<Resource> searchResources(String name, String type, String location, String status) {
        return resourceRepository.findAll().stream()
                .filter(r -> name == null || r.getName().toLowerCase().contains(name.toLowerCase()))
                .filter(r -> type == null || r.getType().equalsIgnoreCase(type))
                .filter(r -> location == null || r.getLocation().toLowerCase().contains(location.toLowerCase()))
                .filter(r -> status == null || r.getStatus().name().equalsIgnoreCase(status))
                .collect(Collectors.toList());
    }
}